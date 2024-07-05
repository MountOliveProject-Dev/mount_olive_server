export async function executePrismaMethod(prisma: any,entityName: string,methodName: string, options = {}) {
  return prisma[entityName][methodName](options);
}