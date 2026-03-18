"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Mic,
  MicOff,
  Send,
  Phone,
  Video,
  MessageCircle,
  Globe,
  Stethoscope,
  AlertTriangle,
  CheckCircle,
  User,
  Calendar,
  FileText,
  Headphones,
} from "lucide-react"

interface Message {
  id: string
  content: string
  sender: "user" | "doctor" | "system"
  timestamp: Date
  language?: string
}

interface PatientData {
  name: string
  age: string
  gender: string
  symptoms: string
  medicalHistory: string
  language: string
}

export default function HealthcarePlatform() {
  const [currentTab, setCurrentTab] = useState("consultation")
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState("en")
  const [patientData, setPatientData] = useState<PatientData>({
    name: "",
    age: "",
    gender: "",
    symptoms: "",
    medicalHistory: "",
    language: "en",
  })
  const [consultationCost, setConsultationCost] = useState(0)
  const [isEmergency, setIsEmergency] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  const languages = {
    en: "English",
    hi: "हिंदी (Hindi)",
    bn: "বাংলা (Bengali)",
    te: "తెలుగు (Telugu)",
    ta: "தமிழ் (Tamil)",
    mr: "मराठी (Marathi)",
    gu: "ગુજરાતી (Gujarati)",
    kn: "ಕನ್ನಡ (Kannada)",
    ml: "മലയാളം (Malayalam)",
    pa: "ਪੰਜਾਬੀ (Punjabi)",
  }

  const emergencyKeywords = [
    "chest pain",
    "difficulty breathing",
    "severe bleeding",
    "unconscious",
    "heart attack",
    "stroke",
  ]

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      recognitionRef.current = new (window as any).webkitSpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = selectedLanguage === "en" ? "en-US" : `${selectedLanguage}-IN`

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInputMessage(transcript)
        setIsListening(false)
      }

      recognitionRef.current.onerror = () => {
        setIsListening(false)
      }
    }
  }, [selectedLanguage])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    // Check for emergency keywords
    const hasEmergencyKeyword = emergencyKeywords.some(
      (keyword) => inputMessage.toLowerCase().includes(keyword) || patientData.symptoms.toLowerCase().includes(keyword),
    )
    setIsEmergency(hasEmergencyKeyword)

    // Calculate consultation cost based on urgency and features
    let baseCost = 50
    if (hasEmergencyKeyword) baseCost = 200
    if (audioEnabled) baseCost += 30
    setConsultationCost(baseCost)
  }, [inputMessage, patientData.symptoms, audioEnabled])

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true)
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  const sendMessage = () => {
    if (inputMessage.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        content: inputMessage,
        sender: "user",
        timestamp: new Date(),
        language: selectedLanguage,
      }

      setMessages((prev) => [...prev, newMessage])

      // Simulate AI doctor response
      setTimeout(() => {
        const doctorResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: generateDoctorResponse(inputMessage),
          sender: "doctor",
          timestamp: new Date(),
          language: selectedLanguage,
        }
        setMessages((prev) => [...prev, doctorResponse])
      }, 1000)

      setInputMessage("")
    }
  }

  const generateDoctorResponse = (userMessage: string): string => {
    const responses = {
      en: [
        "Thank you for sharing your symptoms. Can you tell me when these symptoms started?",
        "I understand your concern. Let me ask a few more questions to better assess your condition.",
        "Based on what you've described, I'd like to know about your medical history.",
        "This sounds concerning. I recommend we schedule an immediate consultation.",
      ],
      hi: [
        "आपके लक्षण साझा करने के लिए धन्यवाद। क्या आप बता सकते हैं कि ये लक्षण कब शुरू हुए?",
        "मैं आपकी चिंता समझता हूं। आपकी स्थिति का बेहतर आकलन करने के लिए मुझे कुछ और प्रश्न पूछने दें।",
        "आपने जो बताया है, उसके आधार पर मैं आपके मेडिकल इतिहास के बारे में जानना चाहूंगा।",
        "यह चिंताजनक लगता है। मैं सुझाता हूं कि हम तुरंत परामर्श का समय निर्धारित करें।",
      ],
    }

    const langResponses = responses[selectedLanguage as keyof typeof responses] || responses["en"]
    return langResponses[Math.floor(Math.random() * langResponses.length)]
  }

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = selectedLanguage === "en" ? "en-US" : `${selectedLanguage}-IN`
      speechSynthesis.speak(utterance)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Stethoscope className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">HealthCare AI</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-40 language-selector">
                  <Globe className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(languages).map(([code, name]) => (
                    <SelectItem key={code} value={code}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={audioEnabled ? "bg-accent text-accent-foreground" : ""}
              >
                <Headphones className="h-4 w-4 mr-2" />
                Audio
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Emergency Alert */}
      {isEmergency && (
        <Alert className="emergency-alert m-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Emergency Detected</AlertTitle>
          <AlertDescription>
            Your symptoms suggest this may be an emergency. Please consider calling emergency services or visiting the
            nearest hospital immediately.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="consultation">Virtual Doctor</TabsTrigger>
            <TabsTrigger value="registration">Patient Info</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Virtual Doctor Consultation */}
          <TabsContent value="consultation" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chat Interface */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageCircle className="h-5 w-5" />
                    <span>AI Doctor Consultation</span>
                    {isListening && (
                      <Badge variant="secondary" className="pulse-animation">
                        Listening...
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>Describe your symptoms and get instant medical guidance</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96 w-full border rounded-md p-4">
                    <div className="space-y-4">
                      {messages.length === 0 && (
                        <div className="text-center text-muted-foreground py-8">
                          <Stethoscope className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Start a conversation with our AI doctor</p>
                        </div>
                      )}
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div className={`chat-bubble ${message.sender}`}>
                            {message.sender === "doctor" && (
                              <div className="flex items-center space-x-2 mb-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src="/caring-doctor.png" />
                                  <AvatarFallback>Dr</AvatarFallback>
                                </Avatar>
                                <span className="text-xs font-medium">AI Doctor</span>
                              </div>
                            )}
                            <p className="text-sm">{message.content}</p>
                            {audioEnabled && message.sender === "doctor" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="mt-2 h-6 px-2"
                                onClick={() => speakText(message.content)}
                              >
                                <Headphones className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  <div className="flex space-x-2 mt-4">
                    <Textarea
                      placeholder="Describe your symptoms..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      className="flex-1"
                      rows={2}
                      onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
                    />
                    <div className="flex flex-col space-y-2">
                      <Button
                        onClick={isListening ? stopListening : startListening}
                        variant={isListening ? "destructive" : "outline"}
                        size="sm"
                        className="voice-button"
                      >
                        {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      </Button>
                      <Button onClick={sendMessage} size="sm">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions & Status */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full bg-transparent" variant="outline">
                      <Video className="h-4 w-4 mr-2" />
                      Video Call
                    </Button>
                    <Button className="w-full bg-transparent" variant="outline">
                      <Phone className="h-4 w-4 mr-2" />
                      Voice Call
                    </Button>
                    <Button className="w-full bg-transparent" variant="outline">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Appointment
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Consultation Cost</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">₹{consultationCost}</div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {isEmergency ? "Emergency Consultation" : "Standard Consultation"}
                      </p>
                      {audioEnabled && (
                        <Badge variant="secondary" className="mt-2">
                          + Audio Support
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Health Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Risk Level</span>
                        <Badge variant={isEmergency ? "destructive" : "secondary"}>
                          {isEmergency ? "High" : "Low"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Response Time</span>
                        <span className="text-sm text-muted-foreground">{isEmergency ? "Immediate" : "< 5 min"}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Patient Registration */}
          <TabsContent value="registration" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Patient Information</CardTitle>
                <CardDescription>Please provide your details for personalized healthcare</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Full Name</label>
                    <Input
                      value={patientData.name}
                      onChange={(e) => setPatientData((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Age</label>
                    <Input
                      type="number"
                      value={patientData.age}
                      onChange={(e) => setPatientData((prev) => ({ ...prev, age: e.target.value }))}
                      placeholder="Enter your age"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Gender</label>
                    <Select
                      value={patientData.gender}
                      onValueChange={(value) => setPatientData((prev) => ({ ...prev, gender: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Preferred Language</label>
                    <Select
                      value={patientData.language}
                      onValueChange={(value) => setPatientData((prev) => ({ ...prev, language: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(languages).map(([code, name]) => (
                          <SelectItem key={code} value={code}>
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Current Symptoms</label>
                  <Textarea
                    value={patientData.symptoms}
                    onChange={(e) => setPatientData((prev) => ({ ...prev, symptoms: e.target.value }))}
                    placeholder="Describe your current symptoms in detail..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Medical History</label>
                  <Textarea
                    value={patientData.medicalHistory}
                    onChange={(e) => setPatientData((prev) => ({ ...prev, medicalHistory: e.target.value }))}
                    placeholder="Any chronic conditions, allergies, medications, or previous surgeries..."
                    rows={3}
                  />
                </div>

                <Button className="w-full">
                  <User className="h-4 w-4 mr-2" />
                  Save Patient Information
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pricing */}
          <TabsContent value="pricing" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Consultation</CardTitle>
                  <CardDescription>Text-based AI consultation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">₹50</div>
                    <p className="text-sm text-muted-foreground">per session</p>
                  </div>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-secondary mr-2" />
                      AI-powered diagnosis
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-secondary mr-2" />
                      Symptom analysis
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-secondary mr-2" />
                      Basic recommendations
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-primary">
                <CardHeader>
                  <CardTitle>Premium Consultation</CardTitle>
                  <CardDescription>Audio + Video support</CardDescription>
                  <Badge className="w-fit">Most Popular</Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">₹80</div>
                    <p className="text-sm text-muted-foreground">per session</p>
                  </div>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-secondary mr-2" />
                      Everything in Basic
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-secondary mr-2" />
                      Voice assistance
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-secondary mr-2" />
                      Audio responses
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-secondary mr-2" />
                      Multilingual support
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Emergency</CardTitle>
                  <CardDescription>Immediate response</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-destructive">₹200</div>
                    <p className="text-sm text-muted-foreground">per session</p>
                  </div>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-secondary mr-2" />
                      Everything in Premium
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-secondary mr-2" />
                      Immediate response
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-secondary mr-2" />
                      Emergency protocols
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-secondary mr-2" />
                      Hospital referrals
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* History */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Consultation History</CardTitle>
                <CardDescription>Your previous consultations and health records</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <Avatar>
                        <AvatarImage src="/caring-doctor.png" />
                        <AvatarFallback>Dr</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-medium">AI Doctor Consultation</h4>
                        <p className="text-sm text-muted-foreground">
                          Symptoms: Headache, fever - Diagnosis: Viral infection
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(Date.now() - item * 24 * 60 * 60 * 1000).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">₹{item === 1 ? 200 : 80}</Badge>
                        <Button variant="ghost" size="sm" className="ml-2">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
