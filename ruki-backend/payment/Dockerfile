# BUILDEANDO
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

# EJECUTANDO
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# CREANDO UN USUARIO NO ROOT
RUN addgroup --system ruki-group && adduser --system --ingroup ruki-group ruki-payment
USER ruki-payment:ruki-group

COPY --from=build /app/target/*.jar app.jar
EXPOSE 8083
ENTRYPOINT ["java", "-jar", "app.jar"]