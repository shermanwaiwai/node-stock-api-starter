# 1. npm install

# 2. npm start

# 3. http://localhost:3000/stock/quote/1
  get : quote from yahoo finance api.
  
# 4. http://localhost:3000/stock/history
  post body  data { symbol : 1 } 
  or { symbol : 1  , startDate : null , endDate : null }

# 5. http://localhost:3000/stock/pattern/
   get recent 3 days for candles checking.
  Post body data { symbol : 1 } 

reference : 

https://github.com/anandanand84/technicalindicators

https://github.com/pilwon/node-yahoo-finance
