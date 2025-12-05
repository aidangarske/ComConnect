#!/bin/bash
# Test script for ComConnect deployment

echo "🔍 Testing ComConnect Deployment..."
echo ""

echo "1️⃣ Testing Backend API..."
BACKEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://comconnect-backend-xzwk.onrender.com/api)
if [ "$BACKEND_RESPONSE" = "404" ]; then
    echo "✅ Backend is running (404 expected for /api root)"
else
    echo "⚠️  Backend returned: $BACKEND_RESPONSE"
fi
echo ""

echo "2️⃣ Testing Backend Login Endpoint..."
LOGIN_TEST=$(curl -s -X POST https://comconnect-backend-xzwk.onrender.com/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test","password":"test"}' | grep -o "error")
if [ "$LOGIN_TEST" = "error" ]; then
    echo "✅ Backend login endpoint is working"
else
    echo "❌ Backend login endpoint failed"
fi
echo ""

echo "3️⃣ Checking Frontend JavaScript Bundle..."
JS_FILE=$(curl -s https://comconnect-frontend.onrender.com/ | grep -o 'src="/assets/index[^"]*\.js"' | cut -d'"' -f2)
echo "   Found: $JS_FILE"
echo ""

echo "4️⃣ Checking API URL in Frontend Build..."
API_CHECK=$(curl -s https://comconnect-frontend.onrender.com$JS_FILE | grep -o 'comconnect-backend-xzwk.onrender.com' | head -1)
if [ ! -z "$API_CHECK" ]; then
    echo "✅ Frontend is configured with PRODUCTION backend URL!"
    echo "   Using: https://comconnect-backend-xzwk.onrender.com"
else
    LOCALHOST_CHECK=$(curl -s https://comconnect-frontend.onrender.com$JS_FILE | grep -o 'localhost:8080' | head -1)
    if [ ! -z "$LOCALHOST_CHECK" ]; then
        echo "❌ Frontend is still using LOCALHOST"
        echo "   This means the .env.production file wasn't picked up during build"
        echo "   Wait for Render to finish deploying, then run this script again"
    else
        echo "⚠️  Could not determine API URL in frontend"
    fi
fi
echo ""

echo "5️⃣ Testing CORS..."
CORS_CHECK=$(curl -s -I https://comconnect-backend-xzwk.onrender.com/api \
    -H "Origin: https://comconnect-frontend.onrender.com" | grep -i "access-control-allow-origin")
if [[ $CORS_CHECK == *"comconnect-frontend"* ]]; then
    echo "✅ CORS is configured correctly"
else
    echo "⚠️  CORS might have issues"
    echo "   $CORS_CHECK"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 DEPLOYMENT STATUS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Frontend: https://comconnect-frontend.onrender.com"
echo "Backend:  https://comconnect-backend-xzwk.onrender.com"
echo ""
echo "Try logging in at: https://comconnect-frontend.onrender.com/login"
echo "Demo account: seeker@comconnect.com / seeker123"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
