# Airlines Empire — Original Game Design Document (verbatim)

This is the user's original v1 vision, pasted as-given. It is intentionally
NOT a sprint plan — see `03_ROADMAP.md` for how this gets broken into
buildable phases. Treat this file as the north star / feature backlog, not
a literal to-do list for the next session.

---

Vision
Build Airlines Empire, the most realistic, persistent, online airline management simulation ever created for mobile. This is not an arcade flight game. It is a business empire simulator where every player owns a real airline company that exists in one shared online world. Every aircraft, employee, airport, passenger, financial transaction, partnership, incident, upgrade, and route is stored permanently in a centralized backend so players can spend months or years growing their airline.

The experience should feel like a blend of Truck Manager, Airline Manager, FlightRadar24, Airport CEO, OpenTTD, and Cities Skylines, but designed specifically for airlines with a premium Apple-inspired interface.

The entire UI should use Apple Liquid Glass / Tahoe-inspired design, featuring rounded pill-shaped cards, blurred glass panels, smooth transitions, premium animations, soft lighting, dynamic shadows, subtle gradients, haptic feedback, and modern typography. Every interaction should feel fluid, polished, and premium.

The project should be developed using React Native (TypeScript) for the mobile application, Node.js (Express/Fastify) for the backend, Aiven SQL as the primary relational database, WebSockets for real-time synchronization, JWT authentication, scalable REST APIs, background workers, caching where appropriate, and a modular architecture capable of supporting millions of players.

Core Gameplay Philosophy
The player is not flying aircraft manually. The player is running an airline. Every decision has consequences. Every flight generates history. Every aircraft ages. Every airport grows. Every employee gains experience. Every passenger affects reputation. Nothing should feel instant. Everything should feel alive. The world continues even while the player is offline.

New Player Experience
Every new player starts by creating their airline. The onboarding process includes: airline name, airline logo upload, airline slogan, airline primary color, airline secondary color, country selection, headquarters airport selection, starter cash, starter premium currency, starter reputation, one free starter aircraft from multiple choices, interactive tutorial. The selected airport becomes the company's permanent headquarters.

World Map
Use OpenStreetMap as the primary interactive world map. The map should support smooth zooming, country borders, airports, flight routes, player airports, partner airports, active aircraft, live aircraft movement, weather overlays, airspace visualization. Initially either all countries are unlocked OR only the player's selected country is unlocked and new countries are unlocked using in-game money — both systems should be configurable. Previously discovered routes remain visible; undiscovered routes remain hidden. When creating routes the player can search airports, search cities, search countries, click airports directly on the map, select airport dots directly. The map should animate route creation beautifully.

Headquarters System
Every airline owns one headquarters representing the airline's operations center. HQ contains: Executive Office, Operations Control Center, Finance Department, Crew Management, Customer Support, Research Center, Lounge Administration, Maintenance Control, Training Academy. HQ levels: Level 1 to Level 5 only. Each level increases maximum aircraft capacity, employee capacity, storage, bonuses, airport management efficiency. Example: Level 1 -> 10 aircraft, Level 2 -> 20, Level 3 -> 35, Level 4 -> 50, Level 5 -> 75. All HQ upgrades stop at Level 5.

Airport Management
Players can purchase airports globally. Every airport has: Passenger Terminal, Cargo Terminal, Hangars, Maintenance Center, Fuel Depot, Airline Lounge, Ground Operations, Security, Parking Stands. Every airport upgrade is capped at Level 5. Upgrade examples: Lounge, Fuel Efficiency, Boarding Speed, Passenger Satisfaction, Baggage Speed, Gate Capacity, Maintenance Quality.

Aircraft System
Build dozens of aircraft inspired by real aircraft. Every aircraft includes: Manufacturer, Model, Generation, Aircraft Type, Passenger Capacity, Cargo Capacity, Maximum Range, Cruise Speed, Maximum Speed, Cruise Altitude, Maximum Altitude, Fuel Tank Capacity, Fuel Consumption, Maintenance Cost, Purchase Price, Current Market Value, Reliability, Engine Health, Airframe Health, Cabin Condition, Noise Rating, CO2 Emissions, Aircraft Age. Aircraft gradually wear over time — older aircraft burn more fuel, need more maintenance, have increased incident probability, reduce passenger satisfaction.

Aircraft Customization
Every aircraft should support customization: airline livery, body color, accent colors, tail design, logo placement, engine colors, winglet colors, registration number, aircraft nickname.

Aircraft Cabin Editor
Provide a visual seat editor similar to cinema seat booking. Every seat is individually rendered. Seat classes: Economy, Premium Economy, Business, First Class. Conversion rules: 2 Economy Seats = 1 Business Seat, 4 Economy Seats = 1 First Class Seat. Show booked seats, empty seats, crew seats, VIP passengers, emergency exits, lavatories, galleys. Passenger occupancy changes every flight — flights should never always be 100% full. Demand depends on reputation, route popularity, season, ticket prices, aircraft quality.

Complete Flight Simulation
Flights should behave like real commercial operations. Nothing should happen instantly. Every flight progresses through realistic phases (full timeline: Scheduled -> Check-in Opens -> Passengers Arrive -> Security Check -> Boarding Begins -> Priority Boarding -> General Boarding -> Final Boarding Call -> Gate Closes -> Boarding Complete -> Pushback Clearance Requested -> ATC Pushback Approved -> Aircraft Pushback -> Taxi Clearance Requested -> Taxi To Runway -> Holding Short -> Waiting For Takeoff Slot -> ATC Takeoff Clearance -> Takeoff Roll -> Rotate -> Initial Climb -> Gear Retracted -> Climb -> Cruise Altitude Reached -> Cruise -> Weather Updates -> Turbulence -> Fuel Monitoring -> Passenger Satisfaction Updates -> Possible Random Events -> Begin Descent -> Approach Clearance -> Landing Queue -> Holding Pattern (if runway busy) -> Weather Check -> Final Approach -> Landing -> Taxi To Gate -> Passenger Exit -> Cleaning -> Refueling -> Maintenance Check -> Ready For Next Flight). Each stage should have realistic timing. Players can watch the entire journey.

Aircraft Live Timeline
Clicking an aircraft opens a complete timeline showing: current flight phase, origin, destination, ETA, current altitude, current speed, fuel remaining, passenger count, crew count, weather, delay reason, engine health, route map. If multi-stop route, show the full chain of airports. Complete timeline should animate.

Flight Physics Simulation
Aircraft gradually accelerate, do not instantly fly. Acceleration: Taxi Speed -> 40 km/h -> 80 km/h -> 140 km/h -> Takeoff Speed -> Climb -> Cruise Speed. Altitude should gradually increase; cruise altitude should vary naturally. Introduce approximately 50+ variations: different climb rates, different cruise speeds, wind effects, temperature effects, weight effects, passenger load, cargo load, fuel weight, engine performance, weather influence. Every flight should feel unique.

Air Traffic Control (ATC)
Aircraft must communicate with ATC. ATC controls pushback, taxi, runway allocation, landing slot, emergency priority, weather delays, holding patterns. Aircraft may need to wait before taxi, takeoff, landing. Busy airports become congested.

Weather System
Dynamic worldwide weather: rain, thunderstorms, snow, fog, wind, sandstorms, heatwaves, crosswinds. Weather affects delays, fuel, passenger happiness, landing, takeoff, route planning. Aircraft may circle the airport while waiting for weather to improve.

Incident System
Random events include engine failure, bird strike, fuel leak, medical emergency, lightning strike, hydraulic failure, cabin depressurization, tire burst, navigation issue. Players choose responses; better responses improve reputation recovery.

Reputation System
Reputation increases by safe flights, luxury cabins, excellent lounges, charity donations, on-time performance, excellent service. Reputation decreases through delays, cancellations, accidents, poor maintenance, bad customer support.

Staff Management
Employees include Pilots, Co-pilots, Cabin Crew, Engineers, Ground Staff, Lounge Staff, Customer Support, Security, Dispatchers, Finance, HR. Every employee has Experience, Salary, Happiness, Loyalty, Skill. Maximum employee skill level is Level 5; training upgrades employees until Level 5 only.

Fleet Management
Manage every aircraft: purchase, lease, sell, retire, maintenance, route assignment, cabin editing, livery customization, profit analysis, flight history.

Route Management
Create airline routes. Display route distance, flight time, passenger demand, fuel requirement, estimated profit. If aircraft cannot reach destination, automatically suggest transit airports, hub airports, connecting flights.

Economy
Track daily/weekly/monthly/yearly profit. Expenses: fuel, salaries, airport fees, maintenance, taxes, loans. Income: tickets, cargo, lounge, partnerships, advertising.

Banking
Banks offer loans, aircraft financing, airport financing. Loan amount depends on assets, reputation, existing debt. Typically finance up to 70% of asset value.

Airline Partnerships
Players can collaborate: codeshare, shared lounges, shared airports, passenger transfers, revenue sharing, joint routes.

Global Multiplayer
Every airline exists online. Players can visit profiles, compare airlines, view fleets, follow airlines, send collaboration requests, compete on leaderboards.

News Network
A global news channel reports accidents, awards, new aircraft, airport purchases, airline rankings, partnerships, financial milestones. News directly influences public reputation.

Achievements
Hundreds of achievements (First Flight, 100 Flights, Million Passengers, Billion Dollar Airline, Five-Star Airline, World's Largest Fleet, etc). Rewards include cosmetics and premium currency.

Mini Games
Examples: aircraft parking, ATC sequencing, baggage sorting, check-in rush, airline trivia. Rewards are cosmetic and premium currency only — no pay-to-win mechanics.

Company Profile
Display airline valuation, cash balance, reputation, fleet, routes, airports, employees, passengers, safety rating, achievements, awards, flight statistics, income charts.

Notifications
Notify players about flight completed, boarding started, flight delayed, incident occurred, maintenance required, loan approved, partnership request, achievement unlocked.

Backend Architecture
Frontend: React Native, TypeScript, React Navigation, Zustand or Redux Toolkit, React Query, Reanimated, React Native Skia, Lottie.
Backend: Node.js, Express or Fastify, REST APIs, WebSockets, JWT Authentication, Scheduled Jobs, Background Workers, Redis Cache (optional).
Database: Aiven SQL. Core tables include: users, airlines, airline_profiles, headquarters, airports, airport_upgrades, aircraft_models, aircraft, aircraft_layouts, seats, routes, route_stops, flights, flight_timelines, flight_events, passengers, employees, maintenance, incidents, weather, finances, transactions, loans, achievements, research, collaborations, alliances, lounges, notifications, leaderboards, news, settings, audit_logs.

The backend must be completely server-authoritative. Every purchase, flight, financial calculation, passenger simulation, route assignment, reputation update, weather event, incident, collaboration, and reward must be calculated on the server to prevent cheating and ensure consistency across the global multiplayer environment.

Overall Goal
Create a living airline universe where thousands or millions of players build, expand, and compete with persistent airline companies. Every airport, aircraft, passenger, employee, weather system, ATC interaction, boarding sequence, flight timeline, financial decision, and partnership should feel believable and interconnected. The final product should set a new benchmark for mobile airline management games by combining realistic airline operations, long-term business strategy, deep progression systems, multiplayer interaction, and a premium Apple-inspired interface into an experience players enjoy for years.

Author's own recommendation (kept verbatim, and being followed):
do not ask the coding AI to build this in a single prompt. This specification is roughly a v1 Game Design Document (GDD). After this, create separate documents for: Database Schema (200-300 tables if needed), Backend API Specification, Game Economy & Balancing, UI/UX Design System, Feature Roadmap (MVP -> v2 -> v3 -> v4), Technical Architecture, State Management & Offline Sync, Animation & Interaction Guidelines. Splitting the project this way will produce much higher-quality results than attempting to generate the entire game in one pass.
