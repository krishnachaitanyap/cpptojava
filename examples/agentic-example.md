# 🤖 Agentic Planning Examples

This document demonstrates the intelligent agentic planning capabilities of the C++ to Java Migration CLI.

## 🏦 Banking System Example

### C++ Code Analysis
The AI agent analyzes this C++ banking code:

```cpp
class BankAccount {
private:
    string accountNumber;
    double balance;
    vector<Transaction> transactions;
    mutex accountMutex;
    
public:
    bool withdraw(double amount) {
        lock_guard<mutex> lock(accountMutex);
        if (balance >= amount) {
            balance -= amount;
            transactions.push_back(Transaction(amount, "WITHDRAW"));
            return true;
        }
        return false;
    }
    
    bool deposit(double amount) {
        lock_guard<mutex> lock(accountMutex);
        balance += amount;
        transactions.push_back(Transaction(amount, "DEPOSIT"));
        return true;
    }
};

class PaymentProcessor {
public:
    bool processPayment(string cardNumber, double amount) {
        // External API call to payment gateway
        PaymentGatewayResponse response = callPaymentGateway(cardNumber, amount);
        return response.success;
    }
};
```

### 🤖 AI Agent Architecture Plan

The agent creates this intelligent architecture plan:

```json
{
  "serviceName": "BankAccountService",
  "database": {
    "type": "postgresql",
    "reason": "C++ code shows complex financial transactions with foreign key relationships and ACID requirements",
    "connectionPool": true,
    "migrations": true,
    "auditTrail": true
  },
  "resilience": {
    "circuitBreaker": true,
    "retry": true,
    "timeout": true,
    "bulkhead": false,
    "rateLimiting": true,
    "reason": "C++ code contains external payment gateway calls and thread synchronization patterns"
  },
  "caching": {
    "enabled": true,
    "type": "redis",
    "reason": "C++ code shows frequent account balance checks and transaction history queries",
    "ttl": 300
  },
  "security": {
    "authentication": true,
    "authorization": true,
    "encryption": true,
    "ssl": true,
    "reason": "Financial data requires strong security measures and PCI compliance"
  },
  "monitoring": {
    "metrics": true,
    "tracing": true,
    "logging": true,
    "healthChecks": true,
    "reason": "Financial transactions require comprehensive audit trails and monitoring"
  },
  "deployment": {
    "docker": true,
    "kubernetes": true,
    "aws": true,
    "ciCd": true,
    "environmentAsCode": true,
    "reason": "Banking systems require enterprise-grade deployment with high availability"
  },
  "customComponents": [
    {
      "name": "Transactional",
      "type": "annotation",
      "purpose": "Ensure ACID properties for financial transactions",
      "implementation": "Custom transaction annotation with rollback on failure"
    },
    {
      "name": "AuditLog",
      "type": "aspect",
      "purpose": "Log all financial transactions for compliance",
      "implementation": "AOP aspect to capture transaction details"
    }
  ],
  "externalIntegrations": [
    {
      "name": "PaymentGateway",
      "type": "api",
      "technology": "REST API",
      "purpose": "Process credit card payments"
    }
  ],
  "properties": {
    "externalized": true,
    "profiles": ["dev", "staging", "prod"],
    "encryption": true,
    "validation": true
  }
}
```

### 🏗️ Generated Spring Boot Architecture

Based on the agentic plan, the system generates:

#### 1. Main Application Class
```java
@SpringBootApplication
@EnableDiscoveryClient
@EnableCaching
@EnableCircuitBreaker
@EnableSecurity
@EnableMetrics
@EnableTransactionManagement
public class BankAccountServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(BankAccountServiceApplication.class, args);
    }
}
```

#### 2. Controller with Resilience Patterns
```java
@RestController
@RequestMapping("/api/accounts")
@Validated
public class BankAccountController {
    
    @PostMapping("/{accountId}/withdraw")
    @CircuitBreaker(name = "withdrawCircuitBreaker")
    @Retry(name = "withdrawRetry")
    @RateLimiter(name = "withdrawRateLimiter")
    @Timed(name = "withdraw.timer")
    public ResponseEntity<WithdrawResponse> withdraw(
            @PathVariable String accountId,
            @Valid @RequestBody WithdrawRequest request) {
        // Implementation with resilience patterns
    }
}
```

#### 3. Service with Caching and Security
```java
@Service
@Transactional
public class BankAccountService {
    
    @Cacheable(value = "accountBalance", key = "#accountId")
    public AccountBalance getBalance(String accountId) {
        // Cached balance retrieval
    }
    
    @CacheEvict(value = "accountBalance", key = "#accountId")
    public boolean withdraw(String accountId, BigDecimal amount) {
        // Transactional withdrawal with cache invalidation
    }
}
```

#### 4. Database Configuration
```java
@Configuration
@EnableJpaRepositories
@EnableTransactionManagement
public class DatabaseConfig {
    
    @Bean
    public DataSource dataSource() {
        // PostgreSQL with connection pooling
    }
    
    @Bean
    public LocalContainerEntityManagerFactoryBean entityManagerFactory() {
        // JPA configuration with audit support
    }
}
```

#### 5. Resilience Configuration
```java
@Configuration
public class ResilienceConfig {
    
    @Bean
    public CircuitBreakerRegistry circuitBreakerRegistry() {
        return CircuitBreakerRegistry.ofDefaults();
    }
    
    @Bean
    public RetryRegistry retryRegistry() {
        return RetryRegistry.ofDefaults();
    }
}
```

## 🛒 E-commerce System Example

### C++ Code Analysis
```cpp
class ProductCatalog {
private:
    map<string, Product> products;
    LRUCache<string, Product> productCache;
    
public:
    Product getProduct(string productId) {
        if (productCache.contains(productId)) {
            return productCache.get(productId);
        }
        Product product = database.getProduct(productId);
        productCache.put(productId, product);
        return product;
    }
};

class ShoppingCart {
private:
    map<string, CartItem> items;
    RedisClient redisClient;
    
public:
    void addItem(string productId, int quantity) {
        CartItem item = redisClient.get("cart:" + userId + ":" + productId);
        item.quantity += quantity;
        redisClient.set("cart:" + userId + ":" + productId, item);
    }
};
```

### 🤖 AI Agent Architecture Plan

```json
{
  "serviceName": "ProductService",
  "database": {
    "type": "mysql",
    "reason": "Product catalog requires relational data with complex queries and indexing",
    "connectionPool": true,
    "migrations": true,
    "auditTrail": false
  },
  "resilience": {
    "circuitBreaker": true,
    "retry": true,
    "timeout": true,
    "bulkhead": false,
    "rateLimiting": true,
    "reason": "High-traffic e-commerce requires protection against overload"
  },
  "caching": {
    "enabled": true,
    "type": "redis",
    "reason": "C++ code shows LRU cache patterns and Redis usage for shopping cart",
    "ttl": 1800
  },
  "security": {
    "authentication": true,
    "authorization": false,
    "encryption": false,
    "ssl": true,
    "reason": "Product data is public but requires secure transport"
  },
  "monitoring": {
    "metrics": true,
    "tracing": true,
    "logging": true,
    "healthChecks": true,
    "reason": "E-commerce requires performance monitoring and availability tracking"
  },
  "deployment": {
    "docker": true,
    "kubernetes": true,
    "aws": true,
    "ciCd": true,
    "environmentAsCode": false,
    "reason": "E-commerce requires scalable deployment with auto-scaling"
  }
}
```

## 🔧 IoT Data Processing Example

### C++ Code Analysis
```cpp
class SensorDataProcessor {
private:
    MongoDBClient mongoClient;
    MessageQueue messageQueue;
    
public:
    void processSensorData(SensorData data) {
        // Store time-series data in MongoDB
        mongoClient.insert("sensor_data", data);
        
        // Send to message queue for real-time processing
        messageQueue.publish("sensor.events", data);
    }
};

class DeviceManager {
private:
    map<string, Device> devices;
    RedisClient deviceStateCache;
    
public:
    DeviceStatus getDeviceStatus(string deviceId) {
        return deviceStateCache.get("device:" + deviceId);
    }
};
```

### 🤖 AI Agent Architecture Plan

```json
{
  "serviceName": "SensorDataService",
  "database": {
    "type": "mongodb",
    "reason": "C++ code shows time-series sensor data storage patterns",
    "connectionPool": true,
    "migrations": false,
    "auditTrail": false
  },
  "resilience": {
    "circuitBreaker": true,
    "retry": true,
    "timeout": true,
    "bulkhead": true,
    "rateLimiting": false,
    "reason": "IoT devices require fault tolerance and connection resilience"
  },
  "caching": {
    "enabled": true,
    "type": "redis",
    "reason": "C++ code shows device state caching patterns",
    "ttl": 600
  },
  "security": {
    "authentication": true,
    "authorization": true,
    "encryption": true,
    "ssl": true,
    "reason": "IoT devices require secure authentication and data encryption"
  },
  "monitoring": {
    "metrics": true,
    "tracing": true,
    "logging": true,
    "healthChecks": true,
    "reason": "IoT systems require real-time monitoring and alerting"
  },
  "deployment": {
    "docker": true,
    "kubernetes": true,
    "aws": true,
    "ciCd": true,
    "environmentAsCode": true,
    "reason": "IoT systems require edge deployment and infrastructure automation"
  },
  "externalIntegrations": [
    {
      "name": "MessageQueue",
      "type": "message-queue",
      "technology": "Apache Kafka",
      "purpose": "Real-time sensor data processing"
    }
  ]
}
```

## 🚀 Benefits of Agentic Planning

### 1. **Intelligent Decision Making**
- AI analyzes C++ patterns to make optimal architectural choices
- Explains reasoning behind each decision
- Adapts to different application domains

### 2. **Production-Ready Architecture**
- Generates enterprise-grade Spring Boot configurations
- Includes resilience, security, and monitoring patterns
- Creates deployment-ready infrastructure

### 3. **Domain-Specific Optimization**
- Banking: PostgreSQL, circuit breakers, audit trails
- E-commerce: MySQL, Redis caching, rate limiting
- IoT: MongoDB, message queues, device authentication

### 4. **Future-Proof Design**
- Scalable architecture patterns
- Cloud-native deployment strategies
- Infrastructure as Code automation

The agentic planning system transforms the migration process from a manual, error-prone task into an intelligent, automated process that generates production-ready Spring Boot microservices. 