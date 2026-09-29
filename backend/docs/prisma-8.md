# Welcome to Prisma ORM 8

Prisma ORM lets you query your database in simple, easy-to-read TypeScript. Define what your data looks like, and Prisma ORM gives you a fully typed client — with autocomplete for every table, column, and relation.

This project is set up for PostgreSQL with Prisma 8 (`@prisma/orm-postgres`).

## Requirements

- **PostgreSQL 15 or newer.** Older servers are not supported. Run `SELECT version()` against your server to verify.

## Your data contract

Your data contract describes your models and sits at `prisma/schema.prisma`.

```typescript
import { db } from './src/prisma/db';

const user = await db.orm.public.User
  .where({ email: 'alice@example.com' })
  .first();
```

## Quick reference

### Commands

```bash
npx prisma contract emit       # Update contract.json and contract.d.ts
npx prisma db update           # Push schema updates to database
npx prisma db init             # Create tables in the database
```
