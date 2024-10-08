const http = require('http');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'data', 'cake.json');  // Đường dẫn tới file cake.json

const server = http.createServer((req, res) => {
    const urlParts = req.url.split('/');

    // Serve images từ thư mục /images
    if (urlParts[1] === 'images') {
        const imagePath = path.join(__dirname, 'images', urlParts[2]);  // Cập nhật đường dẫn tới thư mục /images
        fs.readFile(imagePath, (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end('Image not found');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'image/jpeg' });
            res.end(data);
        });
        return;
    }

    // Serve HTML cho đường dẫn gốc "/"
    if (urlParts[1] === '') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');

        // Đọc dữ liệu từ file cake.json
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
                res.writeHead(500);
                res.end('<h1>Internal Server Error</h1>');
                return;
            }

            const cakes = JSON.parse(data);  // Chuyển dữ liệu JSON thành object
            let htmlContent = `
                <html>
                <head>
                    <title>Cakes</title>
                    <link rel="stylesheet" type="text/css" href="/styles.css">  <!-- Liên kết đến CSS -->
                </head>
                <body>
                    <h1>List of Cakes</h1>
                    <div id="cakes">
            `;

            // Tạo HTML cho từng loại bánh
            cakes.forEach(cake => {
                htmlContent += `
                    <div class="cake">
                        <h2>${cake.name}</h2>
                        <p>${cake.description}</p>
                        <p>Price: $${cake.price}</p>
                        <img src="/images/${cake.image.split('/').pop()}" alt="${cake.name}" width="200">
                    </div>
                `;
            });

            // Kết thúc HTML
            htmlContent += `
                    </div>
                </body>
                </html>
            `;

            res.end(htmlContent);  // Trả về nội dung HTML cho client
        });
    }

    // Xử lý đường dẫn để xem chi tiết sản phẩm
    else if (urlParts[1] === 'cake' && urlParts[2]) {
        const cakeId = parseInt(urlParts[2]);  // Lấy id từ URL
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('<h1>Internal Server Error</h1>');
                return;
            }
            const cakes = JSON.parse(data);
            const cake = cakes.find(cake => cake.id === cakeId);

            if (cake) {
                // Tạo nội dung HTML chi tiết cho sản phẩm
                let htmlContent = `
                    <html>
                    <head>
                        <title>${cake.name}</title>
                    </head>
                    <body>
                        <h1>${cake.name}</h1>
                        <p>${cake.description}</p>
                        <p>Price: $${cake.price}</p>
                        <img src="/images/${cake.image.split('/').pop()}" alt="${cake.name}" width="200">
                    </body>
                    </html>
                `;
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(htmlContent);
            } else {
                res.writeHead(404);
                res.end('<h1>Product not found</h1>');
            }
        });
    }
});

server.listen(3000, () => {
    console.log('Server running at http://localhost:3000/');
});
