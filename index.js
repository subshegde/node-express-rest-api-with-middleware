// console.log("REST API's using Node and express.js")
const express = require('express')
const users = require('./MOCK_DATA.json');
const fs = require('fs');
const { error } = require('console');

const app = express()
const port = 8000

//Middleware
app.use(express.urlencoded({ extended: false }))
//Middleware1 
app.use((req, res, next) => {
    console.log('Hello from middleware 1');
    req.myName = 'Subrahmanya'
    // return res.json({mes:'Hello from middleware 1'})
    next();
})
//middleware2
app.use((req, res, next) => {a
    console.log('Hello from middleware 2', req.myName)
    fs.appendFile('log.txt', `\n${Date.now()}: ${req.method}: ${req.path}: ${req.ip} `, (error, result) => {
        if (error) {
            return res.json({ error: error })
        } else {
            next();
        }
    });
})

// 1
app.get('/users', (req, res) => {
    // html 
    const html = `
    <ul>
    ${users.map(user => `<li>${user.first_name}</li>`).join('')}
    </ul>
    
    `;
    res.send(html)
})

app.get('/api/users', (request, response) => {
    return response.json(users)
})

// 2
app.get('/api/users/:id', (req, res) => {
    const id = Number(req.params.id);
    const user = users.find((user) => user.id === id);
    return res.json(user)
})
//merging all
app
    .route('/api/users/:id')
    .get((req, res) => {
        const id = Number(req.params.id);
        const user = users.find((user) => user.id === id);
        return res.json(user)
    })
    .patch((req, res) => {
        const id = Number(req.params.id);
        const body = req.body;

        // Find the index of the user in the array
        const userIndex = users.findIndex(user => user.id === id);

        if (userIndex === -1) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update the user object
        users[userIndex] = { ...users[userIndex], ...body };

        // Write updated data back to MOCK_DATA.json
        fs.writeFile('./MOCK_DATA.json', JSON.stringify(users, null, 2), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Failed to update user' });
            }
            return res.json({ status: 'User updated successfully' });
        });
    })

    .delete((req, res) => {
        const id = Number(req.params.id);
        // filter out the user to delete
        const filterUsers = users.filter(user => user.id !== id)

        //check if user was found and deleted
        if (filterUsers.length === users.length) {
            return res.status(400).json({ error: 'User not found' })
        }

        //update the array with the filtered users
        users.slice(0, users.length, ...filterUsers)

        //write updated data
        fs.writeFile('./MOCK_DATA.json', JSON.stringify(users, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to delete user' })
            } else {
                return res.json({ status: 'User deleted successfully' })
            }
        })



    })


// // create displaying in console
// app.post('/api/users', (req, res) => {
//     // create new user
//     const body = req.body;
//     console.log("Body", body);
//     return res.json({ status: 'Pending' });
// })

// create , writing in MOCK_DATA.json
app.post('/api/users', (req, res) => {
    const body = req.body;
    users.push({ ...body, id: users.length + 1 });
    fs.writeFile('./MOCK_DATA.json', JSON.stringify(users), (err, data) => {
        return res.json({ status: 'success' });
    });
});








app.listen(port, () => {
    console.log('Server is running at port', + port)
})

