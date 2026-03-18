from _future_ import annotations
import math
import torch
import torch.nn as nn
import torch.nn.functional as F


class MDN(nn.Module):
    """
    Mixture Density Network for 1D targets with K Gaussian components.
    Input: x of shape (B, D)
    Output: pi (B, K), mu (B, K), sigma (B, K)
    """

    def _init_(self, input_dim: int, hidden: int = 64, K: int = 3):
        super()._init_()
        self.input_dim = input_dim
        self.K = K
self.net = nn.Sequential(
            nn.Linear(input_dim, hidden),
            nn.ReLU(),
            nn.Linear(hidden, hidden),
            nn.ReLU(),
        )

        self.pi_head = nn.Linear(hidden, K)
        self.mu_head = nn.Linear(hidden, K)
        self.sigma_head = nn.Linear(hidden, K)

    def forward(self, x):
        h = self.net(x)
        pi = F.softmax(self.pi_head(h), dim=-1)                # mixture weights
        mu = self.mu_head(h)                                   # means
        sigma = torch.exp(self.sigma_head(h)).clamp(1e-3, 50)  # stds
        return pi, mu, sigma

    def nll(self, x, y):
        """Negative log-likelihood for target y under the mixture"""
        pi, mu, sigma = self.forward(x)
        y = y.expand_as(mu)
        norm = -0.5 * ((y - mu) / sigma) ** 2 - torch.log(sigma * math.sqrt(2 * math.pi))
        log_prob = torch.logsumexp(torch.log(pi + 1e-9) + norm, dim=-1)
        return -log_prob.mean()

    @torch.no_grad()
     def predict_params(self, x):
        pi, mu, sigma = self.forward(x)
        return pi.cpu(), mu.cpu(), sigma.cpu()

    @torch.no_grad()
    def sample(self, x, n: int = 50):
        pi, mu, sigma = self.forward(x)
        B, K = pi.shape
        comp = torch.distributions.Categorical(pi)
        idx = comp.sample((n,))  # (n, B)
        chosen_mu = torch.gather(mu.T, 0, idx).T
        chosen_sigma = torch.gather(sigma.T, 0, idx).T
        eps = torch.randn(B, n, device=x.device)
        return (chosen_mu + chosen_sigma * eps).cpu()