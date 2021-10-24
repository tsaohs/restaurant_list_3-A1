if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
const bcrypt = require('bcryptjs')

const db = require('../../config/mongoose')
// 載入 Restaurant model
const Restaurant = require('../restaurant') 
// Load User model
const User = require('../user')

const restaurantList = require('./restaurant.json')

const SEED_USER = [
    {
        name: 'totomomo',
        email: 'user1@example.com',
        password: '12345678',
        restaurantOwned: [1, 2, 3]
    },
    {
        name: 'gigibaba',
        email: 'user2@example.com',
        password: '12345678',
        restaurantOwned: [4, 5, 6]
    }
]

// SEED_USER.map(user => console.log(user))

db.once('open', () => {
    Promise.all(
        SEED_USER.map(seedUser => {
        // console.log(user)
        const {name, email, password} = seedUser
        return bcrypt
        .genSalt(10)
        .then(salt => bcrypt.hash(password, salt))
        .then(hash => {
            console.log('Ready to crate User', {name, email, hash})
            return User.create({name, email, password: hash})
            .catch(error => console.log(error))
        })
        .then(user => {
            const userId = user._id
            // console.log(userId)
            const restaurants = restaurantList.results.filter(restaurant => seedUser.restaurantOwned.includes(restaurant.id))
            // console.log(restaurants)
            restaurants.forEach(restaurant => {restaurant.userId = userId})
            // console.log(restaurants)
            return Restaurant.create(restaurants)
        })
        .catch(error => console.log(error))
    }))
    .then(() => {
        console.log('done')
        process.exit()
    })
    .catch(err => console.log(err)) 
})
