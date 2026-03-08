primero levantamos el local stack con el siguiente comando:
```bash
docker-compose up -d
```
podemos ver los logs
```bash

docker-compose logs -f localstack
docker-compose logs -f backend
```

esto tendra algunos errores especialmente en el servicio del backend y de la base de datos  
pero eso no  importa ya que el localstack se esta levantando y eso es lo importante, una vez que el localstack este levantado podemos ejecutar el siguiente comando para crear la tabla de dynamodb


antes es nesesario crear el bucket primero 
```bash
docker exec warmi_localstack awslocal s3 mb s3://warmi-net-users

```
verificar que se creo
```bash
docker exec warmi_localstack awslocal s3 ls
```


tambien es recomendable descargar el cli
```bash
sudo apt install awscli -y
```

depues 
```bash
aws configure
```


y luego crear el bucket
```bash
aws --endpoint-url=http://localhost:4566 s3 mb s3://warmi-net-users

```


probar los enpoints 

url post: http://localhost:5000/api/auth/register

```bash
{
  "ci": "12345678",
  "nombres": "Juan",
  "apellidos": "Pérez",
  "edad": 25,
  "usuario": "jperez123",
  "pin": "1234",
  "faceImageBase64": "data:image/jpeg;base64,/9j/4AAQ...",
  "documentImageBase64": "data:image/jpeg;base64,/9j/4AAQ..."
}
```

despues

url POST http://localhost:5000/api/auth/login

```bash
{
  "ci": "12345678",
  "pin": "1234"
}
```


Y el login facial:

POST http://localhost:5000/api/auth/login-face
Content-Type: application/json
```bash
{
  "ci": "12345678",
  "faceImageBase64": "data:image/jpeg;base64,/9j/..."
}
```


Y la **ruta protegida** con el token que te devolvió:

GET http://localhost:5000/api/auth/me
Authorization: Bearer eyJhbGci...


