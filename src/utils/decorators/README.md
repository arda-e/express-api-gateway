# Transaction Decorator System

This system provides a clean way to handle database transactions in your services and repositories using decorators.

## Features

- Automatic transaction management with the `@Transaction()` decorator
- Transaction requirement enforcement with the `@RequiresTransaction()` decorator
- Compatible with the existing repository system
- Supports nested transactions (transactions are propagated to inner method calls)

# Error Handling System

The error handling system provides a unified way to handle database and application errors.

## Features

- Automatic error handling with the `@Catch()` decorator
- Specific database error handling (e.g., unique constraint violations)
- Direct error handling with the `handleDatabaseError()` function
- Support for custom error messages

## Usage Examples

### Using the Catch Decorator

The `@Catch()` decorator automatically handles errors thrown by the decorated method. It will translate database error codes into specific error types:

```typescript
import { Catch } from "@utils/decorators";

class UserService {
  @Catch("Failed to create user")
  async createUser(userData: UserData): Promise<User> {
    // If any error occurs, it will be properly handled and rethrown
    return this.userRepository.create(userData);
  }
}
```

### Using handleDatabaseError Directly

You can also use the `handleDatabaseError()` function directly in try/catch blocks:

```typescript
import { handleDatabaseError } from "@utils/decorators/DatabaseErrorHandler";

class UserRepository {
  async createUser(userData: UserData): Promise<User> {
    try {
      // Database operations
      return createdUser;
    } catch (error) {
      handleDatabaseError(error, "Failed to create user");
    }
  }
}
```

### Error Types Handled

The system handles the following PostgreSQL error codes:

- `23505`: Unique constraint violations → `UniqueConstraintError`
- `23503`: Foreign key violations → `ForeignKeyViolationError`
- `23502`: Not-null constraint violations → `NotNullConstraintError`

Other errors are wrapped in a generic `DatabaseError` with your custom message.

### Passthrough Errors

The following error types are passed through without wrapping:

- `ResourceDoesNotExistError`
- `ResourceAlreadyExistsError`
- `ValidationError`
- `AuthenticationError`
- `AuthorizationError`
- `ForeignKeyViolationError`
- `NotNullConstraintError`
- `UniqueConstraintError`
- `AppError`

## Best Practices

1. Use the `@Catch()` decorator on service methods.
2. Provide meaningful error messages to make debugging easier.
3. Use direct `handleDatabaseError()` calls in repositories for more granular control.
4. Always provide a custom error message to `handleDatabaseError()` for better debugging.

# Usage Examples for Transaction Decorators

## Using the Transaction Decorator in Service Methods

The `@Transaction()` decorator automatically creates a Knex transaction and passes it to your method. If a transaction is already provided as an argument, it will reuse that transaction.

```typescript
import { Transaction } from "@utils/decorators";
import { Knex } from "knex";

class UserService {
  constructor(private userRepository: UserRepository) {}

  @Transaction()
  async createUser(userData: UserData, trx?: Knex.Transaction): Promise<User> {
    // Create user with transaction
    return this.userRepository.create(userData, trx);
  }
}
```

## Requiring a Transaction

The `@RequiresTransaction()` decorator ensures that a transaction is provided to the method. This is useful for methods that should only be called within a transaction.

```typescript
import { RequiresTransaction } from "@utils/decorators";
import { Knex } from "knex";

class UserRepository {
  @RequiresTransaction()
  async deleteUserAndRelatedData(userId: string, trx: Knex.Transaction): Promise<void> {
    // This method requires a transaction to be passed
    await this.db("user_settings").where({ user_id: userId }).delete().transacting(trx);
    await this.db("user_profiles").where({ user_id: userId }).delete().transacting(trx);
    await this.db("users").where({ id: userId }).delete().transacting(trx);
  }
}
```

## Composing Transactional Methods

You can compose multiple transactional operations within a single transaction:

```typescript
import { Transaction } from "@utils/decorators";
import { Knex } from "knex";

class OrderService {
  constructor(
    private orderRepository: OrderRepository,
    private paymentRepository: PaymentRepository,
    private inventoryRepository: InventoryRepository,
  ) {}

  @Transaction()
  async createOrderWithPayment(
    orderData: OrderData,
    paymentData: PaymentData,
    trx?: Knex.Transaction,
  ): Promise<Order> {
    // Create order
    const order = await this.orderRepository.create(orderData, trx);

    // Process payment
    const payment = await this.paymentRepository.processPayment(
      {
        ...paymentData,
        orderId: order.id,
      },
      trx,
    );

    // Update inventory
    await this.inventoryRepository.updateStock(orderData.items, trx);

    return order;
  }
}
```

## Repository Implementation

All repository methods should accept an optional transaction parameter and pass it to the database queries:

```typescript
import { Knex } from "knex";
import { KnexRepository } from "@utils/Repository";

class ProductRepository extends KnexRepository<Product> {
  getTableName(): string {
    return "products";
  }

  // Example of a custom method supporting transactions
  async findByCategory(categoryId: string, trx?: Knex.Transaction): Promise<Product[]> {
    const query = this.getQueryBuilder(trx);
    return query.where({ category_id: categoryId });
  }
}
```

## Best Practices

1. Always add an optional `trx?: Knex.Transaction` parameter as the last parameter to methods that perform database operations.
2. Use `@Transaction()` on service methods that need to perform multiple database operations atomically.
3. Use `@RequiresTransaction()` on methods that should only be called within an existing transaction.
4. When creating custom repository methods, always use the `getQueryBuilder(trx)` method to create queries that respect the transaction.
5. In repositories, pass the transaction object to any repository methods called within your method.

## Repository Error Handling

### Using `@Catch()` Decorator on Repository Methods

The `@Catch()` decorator can be applied to repository methods to provide consistent error handling across the data access layer. This approach ensures that all database errors are properly caught, translated into application-specific errors, and include meaningful context about what operation failed.

#### Benefits

- **Consistent Error Handling**: All repository methods use the same error handling mechanism.
- **Contextual Error Messages**: Each method can specify a custom error message that provides context about the failed operation.
- **Clean Repository Code**: Repository methods remain focused on data access logic without being cluttered with try/catch blocks.
- **Centralized Error Translation**: Database errors are consistently translated into application-specific errors with appropriate HTTP status codes.

#### Example

```typescript
import { Catch } from "@utils/decorators/DatabaseErrorHandler";

class UserRepository extends KnexRepository<User> {
  // Apply the @Catch decorator to repository methods
  @Catch("Failed to create user")
  async createUser(data: UserCreateData): Promise<User> {
    const [user] = await this.db("users").insert(data).returning("*");
    return user;
  }

  @Catch("Failed to find user by email")
  async findByEmail(email: string): Promise<User | null> {
    const user = await this.db("users").where({ email }).first();
    return user || null;
  }

  @Catch("Failed to update user")
  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const [user] = await this.db("users").where({ id }).update(data).returning("*");
    return user;
  }
}
```

#### Best Practices

1. **Descriptive Error Messages**: Provide clear, descriptive error messages that indicate what operation failed.
2. **Include Entity Information**: When possible, include information about the entity being operated on (e.g., "Failed to create user with email: user@example.com").
3. **Apply to All Database Operations**: Consistently apply the decorator to all methods that interact with the database.
4. **Private Methods**: Don't forget to apply the decorator to private methods that perform database operations.
