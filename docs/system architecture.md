# System Architecture

## Overview
This document covers system architecture principles, patterns, and best practices for designing scalable and maintainable systems.

## Key Concepts

### Architectural Patterns
- Layered Architecture
- Microservices
- Event-Driven Architecture
- CQRS (Command Query Responsibility Segregation)
- Hexagonal Architecture
- Serverless Architecture

### SOLID Principles
- Single Responsibility Principle
- Open/Closed Principle
- Liskov Substitution Principle
- Interface Segregation Principle
- Dependency Inversion Principle

### Design Patterns (GoF)
Creational Patterns:
- Singleton
- Factory Method
- Abstract Factory
- Builder
- Prototype

Structural Patterns:
- Adapter
- Bridge
- Composite
- Decorator
- Facade
- Flyweight
- Proxy

Behavioral Patterns:
- Chain of Responsibility
- Command
- Interpreter
- Iterator
- Mediator
- Memento
- Observer
- State
- Strategy
- Template Method
- Visitor

## Related Skills
The following skills are relevant to system architecture:

- `backend-development-assistant:architecture` - Covers architectural patterns and principles
  - **Usage**: `@backend-development-assistant:architecture Help me design a microservices architecture for an e-commerce platform`
  - **Examples**: 
    - `"Which design pattern should I use for handling notifications?"`
    - `"Decompose this monolith into microservices"`
    - `"Explain the differences between monolithic and microservices architectures"`

- `backend-development-assistant:microservices` - Focuses on microservices architecture
- `backend-development-assistant:messaging` - Covers messaging patterns and systems
- `backend-development-assistant:performance` - Performance optimization techniques
- `backend-development-assistant:observability` - Monitoring, logging, and tracing
- `backend-development-assistant:security` - Security considerations in architecture
- `backend-development-assistant:devops` - Deployment and infrastructure practices
- `backend-development-assistant:testing` - Testing strategies for distributed systems
- `backend-development-assistant:databases` - Database design and optimization
- `backend-development-assistant:caching-performance` - Caching strategies

## Related Agents
The following agents can assist with system architecture tasks:

- `backend-development-assistant:architecture-patterns-agent` - Specializes in system architecture, SOLID principles, design patterns, microservices, event-driven systems, CQRS, and distributed transactions
  - **Usage**: `@backend-development-assistant:architecture-patterns-agent Design a scalable architecture for a real-time chat application`
  - **Examples**:
    - `"Create an event-driven architecture for order processing"`
    - `"Which architectural style is best for a startup MVP?"`
    - `"Help me apply the Saga pattern for distributed transactions"`

- `backend-development-assistant:devops-infrastructure-agent` - Handles deployment, Docker, Kubernetes, CI/CD, Terraform, Ansible, and networking
- `backend-development-assistant:backend-observability-agent` - Focuses on logging, metrics, distributed tracing, APM, alerting, and incident response
- `backend-development-assistant:caching-performance-agent` - Optimizes performance through caching, load balancing, and scaling
- `backend-development-assistant:database-management-agent` - Covers relational and NoSQL databases, query optimization, and data modeling
- `backend-development-assistant:testing-security-agent` - Handles testing strategies and security best practices

## Best Practices

### Scalability
- Design for horizontal scaling
- Use load balancing effectively
- Implement caching strategies
- Consider database sharding and replication
- Use asynchronous processing where appropriate

### Maintainability
- Follow SOLID principles
- Use modular design
- Implement clear interfaces between components
- Document architectural decisions
- Use consistent coding standards

### Reliability
- Implement circuit breaker patterns
- Use retry mechanisms with exponential backoff
- Design for failure (resilience engineering)
- Implement health checks and monitoring
- Use bulkheads to isolate failures

### Security
- Apply defense in depth
- Use zero trust principles
- Implement proper authentication and authorization
- Encrypt data in transit and at rest
- Regularly update dependencies and patch vulnerabilities

## References
- [Domain-Driven Design](https://domaindrivendesign.org/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Microservices.io](https://microservices.io/)
- [Enterprise Integration Patterns](https://www.enterpriseintegrationpatterns.com/)
- [Software Architecture Guide](https://docs.microsoft.com/en-us/azure/architecture/guide/)