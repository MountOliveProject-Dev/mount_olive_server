import Hapi from "@hapi/hapi";
import server from "../server";
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "SUPER_SECRET_JWT_SECRET";
const JWT_ALGORITHM = "HS256";

import { executePrismaMethod } from "../Helpers";
interface APITokenPayload {
  id: number;
  email: string;
  token: string;
  role: string;
}
export async function validateAPIToken(
  decoded: APITokenPayload,
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { prisma } = request.server.app;
  const { id, email,token} = decoded;

  try {
   
    const findUser = await executePrismaMethod(prisma, "user", "findUnique", {
      where: {
        id: id,
        email: email,
      },
    });
    //

    if (!findUser) {
      console.log("User not found");
      return {
        isValid: false,
        errorMessage: "Invalid credentials! User does not exist",
      };
    }
    if (findUser.expiresAt < new Date() || !findUser.active) {
        console.log("User was inactive for too long, sign in again");
        if (findUser.token != token){
            return {
                isValid: false,
                errorMessage: "Invalid Token",
            };
        }
        return {
          isValid: false,
          errorMessage: "User was inactive for too long, sign in again",
        };
    }
    
    return {
      isValid: true,
      credentials: {
        id: findUser.id,
        email: findUser.email,
        role: findUser.role,
        token:findUser.token
      },
    };
  } catch (err) {
    request.log(
      ["error", "auth", "db"],
      `Failed to get information from database: ${err}`
    );

    return {
      isValid: false,
      errorMessage: "Validation Error, failed to get information from database",
    };
  }
}

function generateAuthToken(
  email: string,
  id: number,
  role: string
): string {
  const jwtPayload = { email,id, role };
  return jwt.sign(jwtPayload, JWT_SECRET, {
    algorithm: JWT_ALGORITHM,
    noTimestamp: true,
  });
}

export async function createUserHandler(request: Hapi.Request, h: Hapi.ResponseToolkit){

    const { prisma } = request.server.app;
    const { email, role } = request.payload as any;
    try{
        
        const checkIfUserExists = await executePrismaMethod(prisma,"user","findUnique",{
            where:{
                email:email
            }
        });
        if(!checkIfUserExists){
            
        }
        const user = await executePrismaMethod(prisma, "user", "create", {
           data:{
               email: email,
               role: role,
               active: false,
               expiresAt: new Date(Date.now()),
           }
        });
        if(!user){

        }
        const token = generateAuthToken(email, user.id, role);
        const updatedUser = await executePrismaMethod(prisma, "user", "update", {
            where: {
                id: user.id,
            },
            data: {
                token: token,
                expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
                active: true,
            },
        });
    }catch(err){
        console.log(err);
    }
}