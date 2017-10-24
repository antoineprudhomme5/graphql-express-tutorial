# GraphQL & Express.js [part 2]

Welcome back !
In the previous part, we've created a GraphQL api on Express.js to manage our Todolist.

*If you missed it, you can find the article [here](https://medium.com/@prudywsh/graphql-express-js-part-1-49a5071636d2).
There is a link to the Github repo wite the code of the part 1 in the article*

In the first part, we didn't use a database. Instead, we've used a javascript object to store our data. It's fine for a example, like in our case. But in the real world, you don't want that, because if you restart you server, all your data are lost.

So right now, we are going to put a database on the code of part 1.

Here, we will use a Mongodb database and mongoose as ORM. But the procedure will be similar for any ORM, so you can do it with the one you like if you want.

You can find the code [here, on my github](https://github.com/prudywsh/graphql-express-tutorial/tree/master/part-2).

## Prepare the ground

### Install the new dependencies

### Create the .env file

## Set up mongoose

### Create the database

install Mongodb

create a new database

+ speak about robomongo

### Connection to mongodb

## Replace the fakeDatabase

### From ES6 class to Mongoose schema

### rewrite resolve methods


*Congratulation, we now have a real database to manage or Todolist !
You know now how to use a database with GraphQL.*
