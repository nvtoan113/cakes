const http = require('http');
const fs = require('fs');
const path = require('path');

// Đường dẫn tới dữ liệu và views
const filePath = path.join(__dirname, 'data', 'cake.json');
const viewsPath = path.join(__dirname, 'views');

// Hàm load template HTML từ file
function loadHTMLTemplate(templateName, callback) {
    const templatePath = path.join(viewsPath, templateName);
    fs.readFile(templatePath, 'utf8', (err, data) => {
        if (err) return callback(err);
        callback(null, data);
    });
}

// Hàm để trả về file tĩnh
const serveStaticFile = (res, filePath, contentType) => {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404 Not Found</h1>');
            return;
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
};

const server = http.createServer((req, res) => {
    const urlParts = req.url.split('/');

    // Serve CSS file
    if (req.url === '/views/styles.css') {
        const cssPath = path.join(viewsPath, 'styles.css');
        serveStaticFile(res, cssPath, 'text/css');
        return;
    }

    // Serve images từ thư mục /images
    if (urlParts[1] === 'images') {
        const imagePath = path.join(__dirname, 'images', urlParts[2]);
        serveStaticFile(res, imagePath, 'image/jpeg');
        return;
    }

    // Serve cake.json
    if (req.url === '/data/cake.json') {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Unable to load data' }));
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(data);
        });
        return;
    }

    // Serve danh sách bánh
    if (urlParts[1] === '') {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end('<h1>Internal Server Error</h1>');
                console.error('Error reading JSON file:', err);
                return;
            }

            try {
                const cakes = JSON.parse(data);
                loadHTMLTemplate('cake-list.html', (err, html) => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'text/html' });
                        res.end('<h1>Internal Server Error</h1>');
                        console.error('Error loading HTML template:', err);
                        return;
                    }

                    let cakeHTML = '';
                    cakes.forEach(cake => {
                        cakeHTML += `
                            <div class="cake">
                                <h2>${cake.name}</h2>
                                <p>${cake.description}</p>
                                <p>Price: $${cake.price}</p>
                                <img src="/images/${cake.image.split('/').pop()}" alt="${cake.name}" width="200">
                                <a href="/cake/${cake.id}" class="details-button">Xem chi tiết</a>
                            </div>
                        `;
                    });

                    html = html.replace('<!-- Nội dung các sản phẩm bánh sẽ được thêm vào đây -->', cakeHTML);
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(html);
                });
            } catch (jsonError) {
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end('<h1>Invalid JSON data</h1>');
                console.error('Invalid JSON format:', jsonError);
            }
        });
        return; // Thêm return ở đây để không tiếp tục xử lý các yêu cầu khác
    }

    // Serve chi tiết bánh
    if (urlParts[1] === 'cake' && urlParts[2]) {
        const cakeId = parseInt(urlParts[2]);

        if (isNaN(cakeId)) {
            res.writeHead(400, { 'Content-Type': 'text/html' });
            res.end('<h1>Invalid Product ID</h1>');
            return;
        }

        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end('<h1>Internal Server Error</h1>');
                console.error('Error reading JSON file:', err);
                return;
            }

            try {
                const cakes = JSON.parse(data);
                const cake = cakes.find(c => c.id === cakeId); // Tìm sản phẩm theo ID

                if (!cake) {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end('<h1>Product not found</h1>');
                    return;
                }

                loadHTMLTemplate('cake-detail.html', (err, html) => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'text/html' });
                        res.end('<h1>Internal Server Error</h1>');
                        console.error('Error loading HTML template:', err);
                        return;
                    }

                    let ingredientsHTML = cake.ingredients && cake.ingredients.length > 0 
                        ? cake.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('') 
                        : '<li>No ingredients available</li>';

                    let componentsHTML = cake.components && cake.components.length > 0 
                        ? cake.components.map(component => `<li>${component}</li>`).join('') 
                        : '<li>No components available</li>';

                    // Thay thế placeholder trong HTML với dữ liệu từ JSON
                    html = html
                        .replace(/{{cake_name}}/g, cake.name)
                        .replace('{{cake_description}}', cake.description)
                        .replace('{{cake_price}}', cake.price)
                        .replace('{{cake_image}}', cake.image.split('/').pop())
                        .replace('{{cake_ingredients}}', ingredientsHTML)
                        .replace('{{cake_components}}', componentsHTML);

                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(html);
                });
            } catch (jsonError) {
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end('<h1>Invalid JSON data</h1>');
                console.error('Invalid JSON format:', jsonError);
            }
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>Page not found</h1>');
    }
});

// Khởi động server
server.listen(3000, () => {
    console.log('Server running at http://localhost:3000/');
});
