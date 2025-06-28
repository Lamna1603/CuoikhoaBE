# Dùng image Node chính thức
FROM node:18

# Tạo thư mục làm việc trong container
WORKDIR /usr/src/app

# Copy file phụ thuộc
COPY package*.json ./

# Cài đặt thư viện
RUN npm install

# Copy toàn bộ source code
COPY . .


# App lắng nghe ở port nào thì EXPOSE port đó (VD: 3000)
EXPOSE 5000

# Chạy ứng dụng
CMD ["npm", "start"]