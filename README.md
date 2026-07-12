# Resume Intelligence Platform

## Project Overview
Resume Intelligence Platform is a modern full-stack application that helps organizations analyze, rank, and manage candidate resumes with AI-assisted insights. The project combines a Java Spring Boot backend with a React frontend to deliver a resilient and extensible experience for recruiters and hiring teams.

## Features
- Resume ingestion and metadata extraction
- AI-powered candidate scoring and ranking
- Structured job-requirement matching
- Searchable talent insights and dashboard views
- Dockerized local development workflow
- CI/CD automation via GitHub Actions

## Architecture
The application is structured into two main services:
- Backend: Spring Boot REST API serving domain logic and persistence operations
- Frontend: React/Vite client that consumes the backend API
- Infrastructure: Docker-based deployment and GitHub Actions for automation

## Tech Stack
- Java 21
- Spring Boot 3.x
- Maven
- React 18
- Vite
- Docker
- GitHub Actions

## Installation
```bash
# Backend
cd backend
mvn clean install

# Frontend
cd ../frontend
npm install
```

## Local Development
```bash
# Start backend
cd backend
mvn spring-boot:run

# Start frontend in a second terminal
cd frontend
npm run dev
```

## Docker Setup
```bash
docker build -t resume-intelligence-platform .
docker run -p 8080:8080 resume-intelligence-platform
```

## API Documentation
API documentation is available through the Spring Boot actuator endpoints and OpenAPI UI when the backend runs locally.

## Screenshots Placeholder
![Screenshots Placeholder](docs/screenshots/placeholder.png)

## License
This project is licensed under the MIT License.
