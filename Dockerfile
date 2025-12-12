# Etapa 1: Compilar el proyecto con Maven
FROM maven:3.9.4-eclipse-temurin-17 AS build

# Crear y moverse a la carpeta del proyecto
WORKDIR /app

# Copiar todo el contenido del repositorio
COPY . .

# Cambiar al directorio donde está el pom.xml
WORKDIR "/app/TiendaWebArca/Backend/Tienda-Web-Arca"

# Compilar sin ejecutar los tests
RUN mvn clean package -DskipTests

# Etapa 2: Ejecutar el .jar generado
FROM eclipse-temurin:17-jdk

WORKDIR /app

# Copiar el .jar compilado desde la imagen anterior
COPY --from=build "/app/TiendaWebArca/Backend/Tienda-Web-Arca/target/"*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]


