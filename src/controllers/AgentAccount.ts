import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const agentCreateAccount = async (req: Request, res: Response) => {
    const {name, phone, email, password, language} = req.body;
    console.log(req.body);
    try {
        const email_exist = await prisma.user.findFirst({
          where: { email: email },
        });
      if(email_exist){
        return res.json({status:"failed", message:`Email has already registered`})
      }
      else{
          const crypt_password = await (bcrypt.hash(password, 10));
            const user = await prisma.user.create({
              data: {
                email: email,
                password: crypt_password,
                user_role: 2,
                status: "active",
              },
            });

            await prisma.agent.create({
              data: {
                user_id: user.id,
                name: name,
                phone:phone,
                status:"active",
                profile_picture:"agent.png",
              },
            });
            for (var i = 0; i < language.length; i++) {
                  await prisma.agentLanguages.create({
                    data: {
                      user_id: user.id,
                      language: language[i],
                    },
                  });
            }
            return res.json({status:"success", message:"Agent Added"})
      }
      } catch (error) {
        return res.json({status:"failed", message:`${error}`})
      }
};

export const agentUpdateAccount = async (req: Request, res: Response, next: Function) => {
  const {agent_name, phone, email,language} = req.body
  let user_id: number | undefined = parseInt(req.body.user_id as string, 10);
  try {
    const email_exist = await prisma.user.findFirst({
      where: { email: email },
    });
  if(email_exist){
      if(email_exist.id == user_id){
            await prisma.agent.updateMany({
              where: { user_id: user_id },
              data: { name: agent_name,phone: phone},
            });

            await prisma.user.updateMany({
              where: { id: user_id },
              data: { email: email},
            });
          await prisma.agentLanguages.deleteMany({
              where: { user_id: user_id },
          });
          for (var i = 0; i < language.length; i++) {
            await prisma.agentLanguages.create({
              data: {
                user_id: user_id,
                language: language[i],
              },
            });
          }
          return res.json({status:"success", message:"Agent Updated"})
      }
      else{
          return res.json({status:"failed", message:"Email has already registered"})
      }    
  }
  else{
      await prisma.agent.updateMany({
              where: { user_id: user_id },
              data: { name: agent_name,phone: phone},
            });

            await prisma.user.updateMany({
              where: { id: user_id },
              data: { email: email},
            });
          await prisma.agentLanguages.deleteMany({
              where: { user_id: user_id },
          });
      for (var i = 0; i < language.length; i++) {
        await prisma.agentLanguages.create({
          data: {
            user_id: user_id,
            language: language[i],
          },
        });
      }
      return res.json({status:"success", message:"Agent Updated"})
  }
  } catch (error) {
    return res.json({status:"failed", message:`${error}`})
  }
};

export const agentUpdateWithPassword = async (req: Request, res: Response, next: Function) => {
  const {agent_name, phone, email, password,language} = req.body
  let user_id: number | undefined = parseInt(req.body.user_id as string, 10);
  const crypt_password = await (bcrypt.hash(password, 10));
  try {
    const email_exist = await prisma.user.findFirst({
      where: { email: email },
    });
  if(email_exist){
      if(email_exist.id == user_id){
            await prisma.agent.updateMany({
              where: { user_id: user_id },
              data: { name: agent_name,phone: phone},
            });
            await prisma.user.updateMany({
              where: { id: user_id },
              data: { email: email,password: crypt_password},
            });
            await prisma.agentLanguages.deleteMany({
              where: { user_id: user_id },
            });
          for (var i = 0; i < language.length; i++) {
            await prisma.agentLanguages.create({
              data: {
                user_id: user_id,
                language: language[i],
              },
            });
          }
          return res.json({status:"success", message:"Agent Updated"})
      }
      else{
          return res.json({status:"failed", message:"Email has already registered"})
      }    
  }
  else{
    await prisma.agent.updateMany({
      where: { user_id: user_id },
      data: { name: agent_name,phone: phone},
    });
    await prisma.user.updateMany({
      where: { id: user_id },
      data: { email: email,password: crypt_password},
    });
    await prisma.agentLanguages.deleteMany({
      where: { user_id: user_id },
    });
      for (var i = 0; i < language.length; i++) {
        await prisma.agentLanguages.create({
          data: {
            user_id: user_id,
            language: language[i],
          },
        });
      }
      return res.json({status:"success", message:"Agent Updated"})
  }
  } catch (error) {
    return res.json({status:"failed", message:`${error}`})
  }
};