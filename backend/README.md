# C Language Learning App - Backend

Backend API server for the C Language Learning mobile application.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + OAuth (Kakao, Google)
- **Validation**: Zod

## Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   ├── middleware/       # Express middleware
│   ├── modules/          # Feature modules
│   ├── database/         # Database layer
│   ├── utils/            # Utility functions
│   ├── types/            # TypeScript types
│   ├── app.ts            # Express app setup
│   └── server.ts         # Server entry point
├── prisma/               # Prisma schema & migrations
└── tests/                # Test files
```

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

### 3. Database Setup

Make sure PostgreSQL is running, then:

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database (optional)
npm run prisma:seed
```

### 4. AI Service Setup (Ollama)

The AI chat and code review features require Ollama with the Kanana Nano model.

**Quick setup:**

```bash
./scripts/setup-ollama-direct.sh
```

For detailed instructions, see [OLLAMA_SETUP.md](./OLLAMA_SETUP.md).

### 5. Run Development Server

```bash
npm run dev
```

Server will start at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio
- `npm run prisma:seed` - Seed database with sample data
- `npm test` - Run tests
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier

## API Documentation

See `/docs/api-spec.md` in the root project directory.

## Database Schema

See `/docs/database-schema.md` in the root project directory.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | Yes |
| `NODE_ENV` | Environment (development/production) | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | Secret for JWT signing | Yes |
| `KAKAO_CLIENT_ID` | Kakao OAuth client ID | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes |
| `OLLAMA_BASE_URL` | Ollama API endpoint | Yes |

See `.env.example` for complete list.

## Development

### Module Structure

Each feature module follows this pattern:

```
modules/problems/
├── problems.controller.ts    # HTTP handlers
├── problems.service.ts       # Business logic
├── problems.routes.ts        # Route definitions
├── problems.types.ts         # TypeScript types
└── problems.validation.ts    # Zod schemas
```

### Adding a New Module

1. Create folder in `src/modules/`
2. Create controller, service, routes, types, validation files
3. Register routes in `src/app.ts`

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch
```

## Deployment

### Build

```bash
npm run build
```

### Run Production

```bash
npm start
```

### Docker (future)

```bash
docker build -t c-learning-backend .
docker run -p 3000:3000 c-learning-backend
```

## Contributing

1. Follow TypeScript strict mode
2. Use Zod for validation
3. Write tests for new features
4. Format code before committing

## License

MIT
