# ✈️ FlightPulse AI

> **India's AI-Powered Aviation Assistant for Smarter Travel**

FlightPulse AI is an intelligent aviation platform designed to help Indian passengers travel with confidence. It combines real-time flight information, airport intelligence, AI assistance, passenger rights guidance, travel readiness assessments, and missed connection prediction into one seamless experience.

Built as a hackathon project, FlightPulse AI demonstrates the integration of AI, knowledge graphs, workflow orchestration, and real-world aviation data to solve practical passenger problems.

---

## 🌟 Features

### 🛫 Flight Tracker
- Live flight tracking
- Real-time flight status
- Flight altitude & speed
- Departure & arrival information
- Interactive flight visualization
- Powered by OpenSky Network API

---

### 🏢 Airport Intelligence
Know your airport before you leave.

- Airport congestion level
- Live weather conditions
- Active arrivals & departures
- Hourly traffic patterns
- Smart airport arrival recommendations
- Airport activity insights

---

### ✈️ TravelReady AI
Your personal international travel advisor.

Supports popular destinations including:

- 🇦🇪 UAE
- 🇯🇵 Japan
- 🇸🇬 Singapore
- 🇹🇭 Thailand
- 🇺🇸 USA
- 🇬🇧 United Kingdom
- 🇨🇦 Canada
- 🇦🇺 Australia
- 🇩🇪 Germany
- 🇫🇷 France
- 🇲🇾 Malaysia
- 🇳🇿 New Zealand
- 🇮🇩 Indonesia

Features:

- Visa requirements
- Passport validity rules
- Country-specific prohibited items
- Medicine restrictions
- Battery & electronics guidance
- Customs allowances
- Travel Readiness Score
- Personalized AI travel summary
- Downloadable travel checklist

---

### 💬 SkyGPT Copilot
AI-powered aviation assistant built using Sarvam AI.

Supports:

- English
- Hindi
- Automatic language switching

Ask about:

- Flight delays
- Airline baggage rules
- Airport guidance
- Visa information
- DGCA passenger rights
- General travel queries

---

### ⚖️ Compensation Assistant

Know your passenger rights instantly.

Features:

- Compensation eligibility checker
- DGCA rule lookup
- Compensation calculator
- Required document checklist
- Complaint letter generator
- AirSewa escalation guidance
- Claim history

---

### 🔗 Missed Connection Predictor

Predict whether you'll make your connecting flight.

Features:

- Personalized transit estimation
- Walking profile analysis
- Terminal transfer estimation
- Security & baggage impact
- Explainable AI recommendations
- Connection risk score
- Smart recovery suggestions
- Compensation handoff

---

## 🏗️ Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- React Hooks
- Recharts

### AI

- Sarvam AI

### Knowledge Graph

- Neo4j AuraDB

### Workflow Orchestration

- Render Workflows (simulated architecture)

### APIs

- OpenSky Network API
- Open-Meteo API

---

## 📂 Project Structure

```
src/
│
├── api/
├── components/
├── hooks/
├── pages/
├── services/
├── utils/
└── assets/
```

---

## 🚀 Installation

Clone the repository:

```bash
git clone https://github.com/yourusername/flightpulse-ai.git
```

Go into the project:

```bash
cd flightpulse-ai
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

---

## 🔑 Environment Variables

Create a `.env` file in the project root.

```env
# OpenSky
VITE_OPENSKY_CLIENT_ID=
VITE_OPENSKY_CLIENT_SECRET=

# Sarvam AI
VITE_SARVAM_API_KEY=

# Neo4j AuraDB
VITE_NEO4J_URI=
VITE_NEO4J_USERNAME=
VITE_NEO4J_PASSWORD=
```

---

## 🧠 Architecture

```
                    FlightPulse AI

              React + Vite Frontend
                      │
      ┌───────────────┼────────────────┐
      │               │                │
 OpenSky API      Neo4j AuraDB     Sarvam AI
      │               │                │
      └───────────────┼────────────────┘
                      │
            Render Workflow Layer
                      │
              Passenger Experience
```

---

## 🎯 Target Users

- Domestic travellers
- International travellers
- First-time flyers
- Frequent flyers
- Business travellers
- Families
- Students travelling abroad

---

## 💡 Why FlightPulse AI?

Most aviation apps focus only on flight tracking.

FlightPulse AI goes beyond that by helping passengers:

- Prepare before travelling
- Understand airport conditions
- Know their rights
- Predict missed connections
- Receive AI-powered travel guidance
- Travel internationally with confidence

---

## 🔮 Future Roadmap

- User authentication
- Saved flight history
- Cloud synchronization
- Boarding pass scanning
- Real-time gate updates
- Push notifications
- Multi-language expansion
- AI itinerary planner
- Wearable device integration

---

## 📸 Screenshots

Add screenshots of:

- Flight Tracker
- Airport Intelligence
- TravelReady AI
- SkyGPT
- Compensation Assistant
- Missed Connection Predictor

---

## 👨‍💻 Developed For

Hackathon Project

FlightPulse AI demonstrates practical use of:

- Artificial Intelligence
- Knowledge Graphs
- Workflow Automation
- Real-time Aviation APIs
- Human-centered UX

---

## 📄 License

This project is developed for educational and hackathon purposes.

---

## ❤️ Acknowledgements

- OpenSky Network
- Open-Meteo
- Neo4j AuraDB
- Sarvam AI
- Render
- React
- Vite
