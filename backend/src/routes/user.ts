import { PrismaClient } from "@prisma/client/edge";
import { Hono } from "hono";
import { withAccelerate } from '@prisma/extension-accelerate'
import { decode, sign, verify } from 'hono/jwt'
import { signUpInput,SignInInput } from '@lakshay_arora0501/medium-common'
type EnvironmentVariables = {
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
};

export const UserRouter = new Hono<EnvironmentVariables>()


UserRouter.post('/signup',async(c)=>{
  const body = await c.req.json()
  const {success} = signUpInput.safeParse(body)

  if(!success){
    c.status(411)
    return c.json({
       message:"Inputs not correct"
    })
  }

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())

 

  try{
    const user = await prisma.user.create({
      data:{
        email:body.email,
        password:body.password,
        name:body.name,
      }
    })

    const token = await sign({id:user.id},c.env.JWT_SECRET)
    console.log(token)
    return c.json({
      jwt:token
    })
  } catch(err){
     c.status(403)
     return c.json({error:"error while signup"})
  }
})

UserRouter.post('/signin',async(c)=>{
const body = await c.req.json()
  const {success} = signUpInput.safeParse(body)

  if(!success){
    c.status(411)
    return c.json({
       message:"Inputs not correct"
    })
  }
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())


  const user = await prisma.user.findUnique({
     where:{
       email:body.email,
       password:body.password
     }
  })
 
  if(!user){
     c.status(403)
     return c.json({error:'User not found'})
  }

  const jwt = await sign({id:user.id},c.env.JWT_SECRET)

  return c.json({jwt})
  
})

