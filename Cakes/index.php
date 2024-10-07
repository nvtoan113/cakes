<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cakes</title>
</head>
<body>
    <h1>List of Cakes</h1>
    <div id="cakes"></div>

    <script>
        fetch('http://localhost:3000/')
            .then(response => response.json())  // Lấy dữ liệu JSON từ server
            .then(data => {
                const cakesDiv = document.getElementById('cakes');  // Nơi sẽ hiển thị bánh
                data.forEach(cake => {
                    const cakeDiv = document.createElement('div');  // Tạo div mới cho từng bánh
                    cakeDiv.innerHTML = `
                        <h2>${cake.name}</h2>
                        <p>${cake.description}</p>
                        <p>Price: $${cake.price}</p>
                        <img src="${cake.image}" alt="${cake.name}" width="200">
                    `;
                    cakesDiv.appendChild(cakeDiv);  // Thêm bánh vào trang
                });
            })
            .catch(error => console.error('Error fetching data:', error));  // Xử lý lỗi
    </script>
</body>
</html>
