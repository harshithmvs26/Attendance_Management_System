# 📊 Attendance Management System – QR Code Based (DBMS Project)
Welcome to the official repository of the QR Code-Based Attendance Management System, a comprehensive DBMS project developed as part of the academic curriculum at SRM Institute of Science and Technology. This project aims to modernize the conventional attendance tracking methods used in educational institutions by introducing a secure, accurate, and user-friendly digital solution. Built with a powerful combination of modern web technologies and database principles, the system addresses key pain points in traditional manual systems such as proxy attendance, record mismanagement, time consumption, and lack of real-time monitoring.

## 📌 Project Overview
The Attendance Management System is a web-based platform designed to automate and streamline attendance tracking using QR code scanning. It supports multi-role access, allowing students, faculty, and administrators to interact with the system according to their specific responsibilities. Faculty members can generate QR codes dynamically for each session, which are valid for a limited time (5 minutes) to prevent misuse. Students can scan these codes to instantly mark their attendance, and administrators can oversee system-wide activity, manage users, and ensure data integrity.

The platform promotes efficiency, transparency, and security in attendance recording. It maintains detailed records of every attendance entry, including metadata like timestamps, device info, and geolocation, making it difficult to manipulate or falsify records. The entire system is developed using Node.js for backend services, Express.js for routing, MySQL with Sequelize ORM for managing relational databases, and Handlebars with Tailwind CSS for rendering responsive and clean front-end interfaces.

## 💡 Key Features
The system offers several innovative and well-integrated features that enhance both usability and security:

QR Code Attendance Mechanism: Each attendance session generates a unique QR code that is valid for only 5 minutes, drastically reducing the chances of proxy attendance or misuse.

Multi-role Dashboards: Students can check attendance history and join classes using QR codes. Faculty can manage sessions, view class data, and monitor student participation. Admins have control over user roles, database management, and report generation.

Instant QR Generation: Faculty can create attendance sessions on the fly, and students can scan and record attendance in real time.

Metadata Logging: Every attendance entry includes timestamp, IP address, device info, and location data.

Improved Relational Structure: Tables are normalized and well-linked with foreign keys to ensure data consistency and scalability.

## 🛠️ Technology Stack
To ensure both scalability and performance, the system is built using a robust set of technologies:

Backend: Node.js and Express.js for fast and efficient server-side operations.

Frontend: HTML, Handlebars (templating engine), and Tailwind CSS for a responsive and modern UI.

Database: MySQL relational database, managed via Sequelize ORM for structured querying and consistency.

Authentication & Security: Secure login, password hashing, role-based access control, and session validation.

This technology stack ensures modularity, maintainability, and a smooth user experience, making the application suitable for real-time institutional deployment.

## 🧱 Database Design & Normalization
The system relies on a relational database design consisting of five main entities:

Users: Stores login information and roles of students, faculty, and administrators.

Classes: Contains metadata about academic subjects and the faculty assigned.

Sessions: Records session details including date, time, and QR code.

Student_Classes: Represents the many-to-many relationship between students and their enrolled classes.

Attendances: Captures the actual attendance data, linked with student and session IDs, along with other verification attributes.

The schema is designed using Entity-Relationship modeling and adheres to the highest level of database normalization (up to BCNF). This minimizes redundancy, eliminates anomalies, and guarantees data integrity during inserts, updates, and deletions.

## 🧠 Backend Intelligence & Smart Features
The backend is not only functional but also intelligent. We implemented stored procedures to identify low-attendance students dynamically, triggers to mark attendance as 'late' based on time thresholds, and cursors to handle bulk attendance checks efficiently. The system also includes custom functions to retrieve session-specific attendance statuses, ensuring quick and accurate queries.

For concurrency and transaction safety, the system supports ACID-compliant operations including transaction rollback, commit, and error handling. The transaction control mechanisms and recovery strategies ensure that the system performs reliably even under multi-user stress or during unexpected failures.

## 🔐 Security, Privacy, and Access Control
Security is at the core of this application. Each user must authenticate before accessing their dashboard, and role-based access ensures that actions are limited according to the user's designation (student, faculty, or admin). Sensitive data is encrypted, and changes to attendance records are logged to maintain transparency.

To prevent misuse, students can only mark attendance for sessions they are enrolled in and within the QR code’s valid time window. Faculty and admins are provided with full audit trails of any edited records, along with timestamped logs.

## 📈 Scalability and Performance
The system is optimized for both current usage and future scalability. Whether it's a small classroom or a large university with thousands of users, the modular design and optimized queries ensure consistent performance. Advanced indexing strategies, caching mechanisms, and load-balanced database calls make it ready for large-scale deployment.

## 📊 Future Scope
Looking ahead, the Attendance Management System can be enhanced in numerous ways. Planned future additions include:

Mobile Application: Native Android/iOS app with push notifications and location-based check-ins.

AI-Based Analytics: Predictive attendance trend detection using machine learning.

Facial Recognition: Integration of biometric verification for zero-touch attendance.

Cloud Hosting & Microservices: Deployment on scalable cloud infrastructure for global reach.

Integration with LMS & HRMS: Seamless data exchange with existing Learning Management or HR systems.

## 👨‍💻 Project Team
This project was developed by:

M.V.S. Harshith – RA2311003011196

V. Vennela Reddy – RA2311003011203

D.S. Rohith – RA2311003011219

Under the guidance of Dr. Baranidharan B,
Professor, Department of Computing Technologies,
SRM Institute of Science and Technology.

## 🏛️ Institution
Department of Computing Technologies
College of Engineering and Technology
SRM Institute of Science and Technology, Kattankulathur

## 📜 License and Use
This repository is intended for academic and demonstration purposes only. Please contact the authors for usage rights, collaborations, or deployment guidance.
