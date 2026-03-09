# Project Structure

```text
demo/
+- pom.xml
+- mvnw
+- mvnw.cmd
+- HELP.md
+- .gitattributes
+- .gitignore
+- .mvn/
¦  +- wrapper/
¦     +- maven-wrapper.properties
+- data/
¦  +- revive.mv.db
+- uploads/
+- src/
¦  +- main/
¦  ¦  +- java/com/sia/demo/
¦  ¦  ¦  +- ReviveApplication.java
¦  ¦  ¦  +- config/
¦  ¦  ¦  ¦  +- DataInitializer.java
¦  ¦  ¦  ¦  +- SecurityConfig.java
¦  ¦  ¦  ¦  +- WebConfig.java
¦  ¦  ¦  +- controller/
¦  ¦  ¦  ¦  +- AdminOrderController.java
¦  ¦  ¦  ¦  +- AuthController.java
¦  ¦  ¦  ¦  +- ClientOrderController.java
¦  ¦  ¦  ¦  +- HealthController.java
¦  ¦  ¦  ¦  +- OrderMessageController.java
¦  ¦  ¦  +- dto/
¦  ¦  ¦  ¦  +- AdminQuoteRequest.java
¦  ¦  ¦  ¦  +- AdminStatusUpdateRequest.java
¦  ¦  ¦  ¦  +- AuthLoginRequest.java
¦  ¦  ¦  ¦  +- AuthRegisterRequest.java
¦  ¦  ¦  ¦  +- AuthResponse.java
¦  ¦  ¦  ¦  +- MessageCreateRequest.java
¦  ¦  ¦  ¦  +- MessageResponse.java
¦  ¦  ¦  ¦  +- OrderResponse.java
¦  ¦  ¦  +- model/
¦  ¦  ¦  ¦  +- Message.java
¦  ¦  ¦  ¦  +- Order.java
¦  ¦  ¦  ¦  +- OrderStatus.java
¦  ¦  ¦  ¦  +- Role.java
¦  ¦  ¦  ¦  +- User.java
¦  ¦  ¦  +- repository/
¦  ¦  ¦  ¦  +- MessageRepository.java
¦  ¦  ¦  ¦  +- OrderRepository.java
¦  ¦  ¦  ¦  +- UserRepository.java
¦  ¦  ¦  +- security/
¦  ¦  ¦  ¦  +- CustomUserDetailsService.java
¦  ¦  ¦  ¦  +- JwtAuthenticationFilter.java
¦  ¦  ¦  ¦  +- JwtService.java
¦  ¦  ¦  +- service/
¦  ¦  ¦     +- CurrentUserService.java
¦  ¦  ¦     +- DtoMapper.java
¦  ¦  ¦     +- MessageService.java
¦  ¦  ¦     +- OrderService.java
¦  ¦  ¦     +- StorageService.java
¦  ¦  +- resources/
¦  ¦     +- application.properties
¦  +- test/
¦     +- java/com/sia/demo/
¦        +- ReviveApplicationTests.java
+- target/        (build output)
+- .idea/         (IDE metadata)
```
