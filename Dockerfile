# Etapa 1: Compilar el proyecto con Maven
FROM maven:3.9.4-eclipse-temurin-17 AS build

# Crear y moverse a la carpeta de trabajo
WORKDIR /app

# Copiar todo el contenido del repositorio
COPY . .

RUN mvn clean package -DskipTests

# Etapa 2: Ejecutar el .jar generado
FROM eclipse-temurin:17-jdk

WORKDIR /app

# Copiar el .jar compilado. 
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]


