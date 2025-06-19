FROM node:18

WORKDIR /usr/src/app

# Install k6
RUN apt-get update && \
    apt-get install -y gnupg curl && \
    curl -s https://dl.k6.io/key.gpg | apt-key add - && \
    echo "deb https://dl.k6.io/deb stable main" | tee /etc/apt/sources.list.d/k6.list && \
    apt-get update && \
    apt-get install -y k6 && \
    rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

RUN chmod +x run.sh

CMD ["/usr/src/app/run.sh"]
