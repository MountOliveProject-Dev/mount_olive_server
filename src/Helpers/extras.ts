



export const getCurrentDate = () => {
  //let getCurrentDate() use this format 2024-09-03
  return new Date().toISOString().split("T")[0];
};

//