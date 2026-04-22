  
**Smart ParkEase**

*AI-Based Smart Parking Allocation and Management System*

**Synopsis**

Minor Project Report

**Submitted By:**

Yuvraj

Raj

Lucy

**TABLE OF CONTENTS**

1\. Introduction3

2\. Project Rationale4

3\. Objectives and Scope5

4\. Methodology6

5\. Technology Stack7

6\. Testing Strategy8

7\. Limitations and Future Scope9

8\. Team Work Distribution10

9\. Conclusion11

**1\. INTRODUCTION**

Parking is a bigger problem than most people realize. In crowded places like hospitals, malls, or college campuses, people spend a lot of time just trying to find one empty slot. You drive in, look around, and half the time you still end up circling the same rows again. It is frustrating, it wastes fuel, and it slows down the entry for everyone behind you. The real issue is simple — there is no way to know in advance which slots are free and which are taken.

Right now, most parking lots run on a paper-based system. A guard at the gate writes down the vehicle number, assigns a slot number, and notes the time. When the vehicle leaves, someone does the billing by hand. This works okay when the lot is small and not very busy. But the moment things get crowded, mistakes happen. Slots get double-assigned, billing takes longer, and the management has no clear picture of how many spots are actually available at any given moment.

Our project, Smart ParkEase, is a web-based system that tries to fix this. The idea is simple — show a live grid of all parking slots, color-coded so the admin can see at a glance what is free and what is occupied. When a new vehicle comes in, the system picks an available slot automatically. The admin can also override this and assign a slot manually if needed. When the vehicle leaves, the system calculates how long it was parked and generates a bill right away. The whole thing runs in a browser, so no special hardware or app is needed.

We did not use real sensors for this project because that would have made it too costly and complicated for us to build. Instead, we used a database to simulate the real-time logic. Whenever the admin updates a slot through the form, the grid reflects that change immediately. It is not perfect, but it gets the job done and was something the three of us could actually build within our skill level and the time we had.

**2\. PROJECT RATIONALE**

When we were thinking about what to build for this project, we wanted something that solves a problem people actually face — not just a demo system that looks good but does not mean anything in real life. Parking came up pretty quickly. All three of us have been in situations where finding a parking spot took longer than the actual trip. That made it feel like a worthwhile problem to work on.

We looked at what already exists. Some big malls and airports use sensor-based systems where each slot has a sensor that detects whether a vehicle is parked there or not. Those systems work well but they are expensive to set up and maintain. Most medium or small parking lots cannot afford that. On the other end, some places still use notebooks and manual billing. We thought there had to be something in between — a software-only system that at least brings the management side online, even if it cannot detect vehicles automatically.

That gap is basically what we tried to fill. Our system does not need sensors. The admin handles vehicle entry and exit through a web form, and the database keeps track of everything. The grid updates the moment a slot status changes, so the admin always has a current view of the lot. We also added a revenue analytics section because we felt the admin should be able to see not just what is happening right now, but also how the parking lot has been doing over time — like total income this week or this month.

For us personally, this project covered a lot of things we wanted to learn — real-time databases, dynamic UIs, billing logic, and user authentication. Those are topics that kept coming up in our coursework but we never had a chance to actually use them in a full project. This gave us that chance. It also pushed us to use tools we had not worked with before, like Firebase and Chart.js, which we figured out mostly through documentation and trial and error.

**3\. OBJECTIVES AND SCOPE**

**Objectives:**

* Build a color-coded live parking grid where each slot appears green if it is empty and red if it is occupied, giving the admin a clear view of the lot at any moment without having to check records manually.

* Set up an auto-allocation system that picks the nearest free slot when a new vehicle arrives, so the admin does not have to search for an available spot every time.

* Give the admin a manual override option to assign a specific slot themselves, in cases where the automatic suggestion does not suit the situation.

* Create a vehicle entry form where the admin logs the vehicle number, type of vehicle, and the time of entry whenever a new vehicle arrives at the parking lot.

* Build a vehicle exit and billing page that calculates the total parking duration, applies the rate per hour, and generates a clear bill for the vehicle owner before they leave.

* Add a dashboard that shows four main numbers at a glance — total slots in the lot, how many are occupied, how many are free right now, and today's total billing amount.

* Include a basic revenue analytics chart that shows billing totals by day or by month, so the admin can track how the parking lot is performing over a period of time.

**Scope:**

This system is meant for small to medium parking lots that want to go digital without spending money on hardware. Everything runs through a web browser, which means no installations and no special devices needed. The admin manages the entire parking operation from one place — from adding and setting up slots, to handling vehicle entry and exit, to checking revenue at the end of the day.

The system currently handles one type of user — the admin. Vehicle owners do not have a separate login. The admin fills in the entry and exit details on their behalf. This keeps things simple and makes sense for the kind of parking lots this system is designed for, where a single attendant or manager handles all the operations.

The current version does not include real sensor integration, a mobile app, or an online payment gateway. These were outside what we could realistically build in the available time. QR code entry is included as an optional feature for demonstration. The focus for this version was getting the core operations right — accurate slot tracking, correct billing, and clean reporting that the admin can actually rely on.

**4\. METHODOLOGY**

We did not follow a strict software engineering process since that would have been too formal for a team of three students with basic coding experience. But we did break the work into clear phases so we always knew what we were building next. We also used AI-assisted coding tools like Claude AI and GitHub Copilot to help us when we got stuck, which happened more than a few times.

**Phase 1: Requirement Gathering**

Before writing any code, we spent time figuring out exactly what the system needed to do. We talked to a person who manages a small parking area near our college and asked how they currently handle things — what information they write down, how they assign slots, and how they calculate bills. That conversation was really useful because it showed us which features matter in practice. We also watched a few YouTube videos of existing parking management software to get a sense of what the admin interface should look like. After all that, we made a simple list of must-have features and nice-to-have features.

**Phase 2: System Design**

Once we knew what to build, we designed how the database should be structured in Firebase. We created three main collections: one for slot records, one for vehicle entry and exit logs, and one for billing data. We also drew rough sketches of the main screens — the grid view, the entry form, the exit and billing page, and the dashboard. We kept the design very basic because we did not want to spend too much time on styling and lose time on the actual logic.

**Phase 3: Development**

We built the system in small steps. The grid came first, because that was the core visual feature. Getting it to update in real time based on Firebase data took us a couple of days to figure out. After that we added the entry form, then the auto-allocation logic, then the exit and billing page. The dashboard and charts came next, and the QR code feature was the last thing we added. We tested each piece as we went rather than waiting until the end, which saved us from some bigger problems later.

**Phase 4: Testing and Deployment**

We tested the full system by running through several scenarios — multiple vehicles entering at the same time, vehicles with long and short stays, and edge cases like trying to assign a slot that is already taken. Once we were happy that everything worked correctly, we deployed the project on Firebase Hosting. The code is all on GitHub and we used branches to make sure our work did not conflict with each other during development.

**5\. TECHNOLOGY STACK**

We chose tools that were free, well-documented, and beginner-friendly. None of us had deep experience in full-stack development before this project, so we had to be careful not to pick something that would take months to learn. The stack we ended up with let us build what we needed without getting stuck on the tools themselves.

**Frontend:**

* React.js \+ Vite \+ Tailwind CSS for a high-performance, responsive user interface and rapid development using utility-first styling.

* React Router for handling client-side navigation between the dashboard, grid view, and billing pages seamlessly.

**Backend:**

* Firebase Authentication \+ Firestore \+ Firebase Storage to manage secure admin access, scalable document-based data, and file storage.

**Hosting:**

* Vercel for automated deployments and fast content delivery via its global edge network.

**Charts:**

* Recharts or Chart.js for building dynamic revenue visualizations and parking analytics.

**Forms:**

* React Hook Form \+ Zod for robust form management and schema-based validation of vehicle entries.

**Utilities:**

* date-fns for date manipulation and a specialized QR code library for ticket generation.

**Version Control:**

* GitHub for collaborative versioning, code reviews, and maintaining a centralized source of truth.

**6\. TESTING STRATEGY**

Testing was mostly done by hand. We do not have experience with automated testing frameworks, so we ran through scenarios ourselves and noted down what broke and what worked. We tried to be thorough about it — not just checking the happy path but also checking what happens when something goes wrong or when the input is unexpected.

**Functional Testing:**

We went through every single feature and checked if it did what it was supposed to do. For auto-allocation, we tested what happened when multiple slots were free and made sure it always picked the lowest-numbered available slot. For billing, we entered a vehicle at a known time and exited it after a set number of hours, then checked if the calculated bill matched what we expected. We also tested the entry form with missing inputs to make sure the system did not accept incomplete records.

**Integration Testing:**

Once individual features were working, we tested them together. The main thing we checked here was the flow from vehicle entry to slot status change to grid update. We wanted to make sure that when the admin submitted an entry form, the slot turned red on the grid right away without needing a refresh. Same thing on the exit side — when a vehicle checked out, the slot had to go back to green and the billing record had to save at the same time. We found a bug here early on where the slot status was updating but the grid was not re-rendering immediately. We fixed that by adjusting how we were listening to Firebase changes.

**Usability Testing:**

We asked one of our classmates to sit down with the admin dashboard and try to do basic tasks without us explaining anything. We watched where they hesitated or got confused. The main feedback we got was that the exit button was not obvious enough and that the slot grid did not clearly explain what the colors meant. We added a small legend below the grid and made the exit and billing button more prominent after that. It made a noticeable difference in how easy the flow felt.

**Security Testing:**

We checked that someone who is not logged in cannot access the admin dashboard by typing the URL directly. Firebase Authentication handles the redirect automatically, but we wanted to confirm it was working as expected. We also set Firebase database rules so that read and write access requires an authenticated session. Without that, anyone who found our database URL could have read or changed the data freely.

**7\. LIMITATIONS AND FUTURE SCOPE**

**Limitations:**

We want to be honest about what the current version of this system cannot do:

* There are no physical sensors. Slot status only changes when the admin submits a form. If a vehicle parks without going through the entry process, the system has no way of knowing. This is the biggest practical limitation.

* The system has only one user role. There is no separate login for vehicle owners or for parking attendants working different shifts. Everything goes through a single admin account.

* The auto-allocation logic is basic. It just picks the lowest available slot number. It does not account for vehicle type, slot size, distance from different entry gates, or reserved slots.

* There is no payment feature. Bills are generated by the system but collection is done manually. There is no integration with any payment gateway.

* The system only supports one parking lot. A business with multiple locations would need separate instances of the system for each location, with no central overview.

**Future Scope:**

Given more time and better technical skills, here is what we would want to add next:

* Connect the system to IoT sensors — like ultrasonic sensors placed in each slot — so that slot status updates automatically without the admin needing to enter anything manually.

* Build a mobile app for vehicle owners where they can check how many slots are available before driving to the lot and reserve a slot in advance.

* Add an online payment option using a gateway like Razorpay so vehicle owners can pay digitally and receive a digital receipt by SMS or email.

* Add multiple user roles — a super admin who manages several parking locations from one account, and individual attendants with limited access for handling day-to-day entry and exit.

* Improve the slot allocation logic to consider vehicle type. Two-wheelers and four-wheelers should be directed to different zones, and larger vehicles should be assigned wider slots automatically.

**8\. TEAM WORK DISTRIBUTION**

Our team had three members — Yuvraj, Raj, and Lucy. We split the work based on the new technology stack, focusing on specialized areas while maintaining the spirit of shared effort during integration and testing.

**Yuvraj — Frontend Development and UI:**

Yuvraj was responsible for the entire modern user interface. This included setting up the project with **React.js \+ Vite**, developing the responsive layout using **Tailwind CSS**, and managing client-side navigation with **React Router**. He also implemented all complex forms (entry, exit, billing) using **React Hook Form** with **Zod** for schema validation.

**Raj — Backend Logic, Database, and DevOps:**

Raj handled the core serverless architecture and deployment pipeline. He configured **Firebase Authentication**, designed the scalable database structure in **Firestore**, and set up **Firebase Storage**. He wrote the critical business logic for auto-allocation and the billing calculation function. Raj was also responsible for version control using **GitHub** and automating deployment via **Vercel**.

**Lucy — Analytics, Testing, and Utilities:**

Lucy focused on data visualization, quality assurance, and utility features. She managed the **Testing Strategy**, ran all functional and integration tests, and wrote the final documentation. She was responsible for implementing the revenue analytics section using **Recharts or Chart.js** and integrating the **date-fns** library for time calculations. She also developed the QR code ticket generation feature.

**Shared Work:**

All three members collaborated on the initial requirement gathering, system design, and final integration testing.

**9\. CONCLUSION**

Smart ParkEase came out of a simple observation — parking management is something most places still handle with pen and paper, and there is a clear gap for a basic software solution that does not require expensive hardware. We are three students with limited coding experience, and we wanted to see if we could actually build something useful within those constraints. Honestly, the project turned out better than we expected when we started.

What we built is a working web-based parking system. An admin can log in, see the current state of the parking lot on a live grid, handle vehicle entry and exit through simple forms, and check the revenue at the end of the day. The auto-allocation feature means the admin does not have to think about which slot to assign every time a vehicle arrives. The billing is calculated automatically and stored in the database. For a three-person student team, we think that covers a meaningful amount of ground.

We were also honest with ourselves about what we could not do in this version. No real sensors, no mobile app, no online payments. Those are real limitations. But knowing what the next steps would be is itself useful — it means this project has a clear path forward, not just a finished state. If we continue working on it, there is a lot more we could add.

More than the project itself, what this experience gave us was confidence. We figured out Firebase, we debugged real integration problems, we got feedback from people outside our team and used it to improve what we built. That process of building, breaking, fixing, and shipping something that actually works is something none of us had done before. That is probably the most valuable thing we are taking away from this.

**\* \* \* End of Synopsis \* \* \***