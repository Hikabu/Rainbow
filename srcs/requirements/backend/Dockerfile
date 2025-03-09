FROM python:3.12

LABEL org.opencontainers.image.authors="Lera, Arturo, Morand"

WORKDIR /usr/src/app

# Install system dependencies first
RUN apt-get update && apt-get install -y netcat-openbsd && rm -rf /var/lib/apt/lists/*

# Install Pipenv separately to improve caching
RUN pip install --upgrade pip && pip install pipenv

# Copy dependency files first for better Docker caching
COPY Pipfile Pipfile.lock ./

# Install dependencies using Pipenv
RUN pipenv install --deploy --ignore-pipfile

# Copy the rest of the project files
COPY . .

# Create STATIC_ROOT directory
RUN mkdir -p /usr/src/app/staticfiles

# Collect static files
RUN pipenv run python manage.py collectstatic --noinput

# Copy entrypoint script and make it executable
COPY ./tools/entrypoint.sh /usr/src/app/entrypoint.sh
RUN chmod +x /usr/src/app/entrypoint.sh

ENTRYPOINT ["/usr/src/app/entrypoint.sh"]

# Start Daphne server using Pipenv
CMD ["pipenv", "run", "daphne", "-b", "0.0.0.0", "-p", "8000", "project.asgi:application"]
# CMD sh -c "python3 manage.py makemigrations --noinput && \
#            python3 manage.py migrate --noinput && \
#            daphne -b 0.0.0.0 -p 8000 project.asgi:application"
