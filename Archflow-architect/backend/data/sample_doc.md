# System Design Guide: High-Scale Video Streaming (Netflix-like)

## 1. Architecture Overview
A high-scale video streaming architecture requires microservices, global content delivery networks (CDNs), and highly resilient databases. The frontend communicates with a gateway (e.g., API Gateway) which routes to specialized backend microservices: User Service, Catalog Service, Recommendations, and Streaming Service.

## 2. API Design
- `POST /api/users/login` - Authenticate users
- `GET /api/catalog/movies` - Retrieve list of movies based on metadata
- `GET /api/stream/url/{movie_id}` - Retrieve the optimized CDN URL for video playback

## 3. Database Schema
- **Users Table**: id (UUID), email (String), subscription_tier (Enum)
- **Movies Table**: id (UUID), title (String), description (Text), release_date (Date)
- **Watch History Table**: user_id (UUID), movie_id (UUID), timestamp (Date), duration_watched (Int)

## 4. Infrastructure
- Compute: Kubernetes (EKS/GKE) for orchestration microservices.
- Storage: Amazon S3 for video assets.
- CDN: Cloudflare or AWS CloudFront for global fast delivery.
- Database: Amazon Aurora (PostgreSQL) for transactional data, Cassandra for high-write viewing history.
- Cache: Redis clusters for fast metadata lookups and session state.
