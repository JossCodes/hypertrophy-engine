# hypertrophy-engine

API designed to generate, track and adapt weekly trining plans based on user profiles

## 🔐 JWT Setup (RS256)

Hypertrophy Engine uses **RS256 JWTs** for secure authentication.

### Generate your keys

```bash
# Generate a 2048-bit RSA private key
openssl genrsa -out ./keys/jwtRS256.key 2048

# Extract the public key
openssl rsa -in ./keys/jwtRS256.key -pubout -out ./keys/jwtRS256.key.pub
```
