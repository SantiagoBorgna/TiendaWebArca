# El Arca Home

**El Arca Home** is a robust e-commerce web application developed for a home goods store. It provides a seamless shopping experience with dynamic inventory management and a secure backend architecture.

## 🚀 Features

* **Dynamic Product Listing:** Real-time rendering of products with stock control.
* **Smart Filtering:** Filter products by category and price range.
* **Shopping Cart:** Fully functional cart with `localStorage` persistence (cart items survive page refreshes).
* **Checkout Logic:** Order summary calculation including shipping options (Store Pickup vs. Home Delivery).
* **Secure Architecture:** Backend credentials managed via environment variables.

## 🛠 Technologies Used

### Frontend
* **HTML5 & CSS3** (Responsive Design)
* **JavaScript** (Vanilla ES6+)
* **Fetch API** for backend integration

### Backend
* **Java 17**
* **Spring Boot 3** (REST APIs, Core)
* **Spring Data JPA** (Hibernate)
* **MySQL** (Relational Database)
* **Maven** (Dependency Management)

---

## ⚙️ Setup Instructions

Follow these steps to run the project locally.

### 1. Prerequisites
Ensure you have the following installed:
* **Java JDK 17** or higher.
* **MySQL Server** running locally (or access to a cloud DB).
* **Git**.

### 2. Clone the Repository
```bash
git clone [https://github.com/SantiagoBorgna/TiendaWebArca.git](https://github.com/SantiagoBorgna/TiendaWebArca.git)
cd TiendaWebArca
```
### 3. Database Configuration
1.  Open your MySQL client (Workbench, DBeaver, or Terminal).
2.  Create a new empty database named `arcadb`:
    ```sql
    CREATE DATABASE arcadb;
    ```

### 4. Environment Variables
This project uses **Environment Variables** for security to avoid hardcoding credentials. You do not need to edit `application.properties`.

You need to set the following variables in your IDE (IntelliJ/VS Code) or your Operating System:

| Variable | Description | Example (Localhost) |
| :--- | :--- | :--- |
| `DB_HOST` | Database URL/Host | `localhost` |
| `DB_USER` | Database Username | `root` |
| `DB_PASSWORD` | Database Password | `your_password` |

**Option A: Running via Terminal (Linux/Mac/Git Bash)**

You can pass the variables directly in the command line:
```bash
export DB_HOST=localhost
export DB_USER=root
export DB_PASSWORD=your_real_password
./mvnw spring-boot:run
```
**Option B: Running via VS Code / IntelliJ**

Add the variables to your Run Configuration (Launch configuration) under "Environment Variables".

### 5. Run the Application
Once variables are set, execute the application using the Maven Wrapper included in the project:

```bash
# Windows
./mvnw.cmd spring-boot:run

# Linux / Mac
./mvnw spring-boot:run
```
The backend will start at: http://localhost:8080

---

## 📸 Screenshots

<img width="100%" alt="Home Page" src="https://github.com/user-attachments/assets/5e0fe510-aa02-41ca-82f8-c3f90b24b131" />
<br>
<img width="100%" alt="Product Detail" src="https://github.com/user-attachments/assets/b7559d3d-3d6a-4e9c-a651-30daeaeb17c4" />
<br>
<img width="100%" alt="Shopping Cart" src="https://github.com/user-attachments/assets/f085e984-2e19-4c28-ba5e-8e0f8936e314" />
<br>
<img width="100%" alt="Checkout" src="https://github.com/user-attachments/assets/b50d554a-8044-4f5a-93ec-bd28b126d704" />

## 👤 Author
**Santiago Borgna**
* Software Engineer
