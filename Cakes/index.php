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
            .then(response => response.json())  
            .then(data => {
                const cakesDiv = document.getElementById('cakes');  
                data.forEach(cake => {
                    const cakeDiv = document.createElement('div');  
                    cakeDiv.innerHTML = `
                        <h2>${cake.name}</h2>
                        <p>${cake.description}</p>
                        <p>Price: $${cake.price}</p>
                        <img src="${cake.image}" alt="${cake.name}" width="200">
                    `;
                    cakesDiv.appendChild(cakeDiv);  
                });
            })
            .catch(error => console.error('Error fetching data:', error));  
    </script>
</body>
</html>
