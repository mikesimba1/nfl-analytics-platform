# NFL Analytics Platform

This project is a comprehensive platform for NFL analytics, providing predictions, data analysis, and insights.

## Development

This project is fully containerized using Docker. This ensures a consistent and reproducible development environment.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop) installed and running on your machine.

### Running the Application

To start the entire application (both the backend API and the frontend web server), navigate to the root directory of the project and run the following command:

```bash
docker-compose up --build
```

- The frontend will be available at [http://localhost:3000](http://localhost:3000).
- The backend API will be available at [http://localhost:3001](http://localhost:3001).

The `--build` flag is only necessary the first time you run the application or after making changes to the `Dockerfile`s or dependencies. For subsequent launches, you can simply use `docker-compose up`.

To see the combined logs from both services in real-time, you can use:

```bash
docker-compose logs -f
```

To stop the application, press `Ctrl+C` in the terminal where `docker-compose` is running, or run:

```bash
docker-compose down
``` 