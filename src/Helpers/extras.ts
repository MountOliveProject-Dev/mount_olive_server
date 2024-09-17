import {
  google, 
  drive_v3,
  Auth, 
} from "googleapis";
export const GOOGLE_DRIVE_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQCqBclF/xfl/ttV\noWmiCDf7wltvHg2BreumPmxK+ixTvhHJk0J2uUAYna03KPfeDrs1YVwC7r8FE1+C\nRva3Nh9seQIvNAicH/5s6M38WAiF6LnZNKRbbwEGXfu+Ze1iyUe1QWHrzkbKazUa\nXamCb96HI6CvMCxsd568Z1pHNZsykdSq08bJUwRY1qlvnsCObsrtzxpbrbY7Z8vH\nDJDtk3jf0NVHBspQZlPum489k1Qi3xRSFUtrcTcicCilqru+5G1X0Mtej1+u5Nc1\n7RpdbmVPVEwjd8oJ2tFdZi8d+RQ3x0jIovOp0ZOkHxMuONP/bWUjq8RVF9gvHOWY\nVJSpreVjAgMBAAECggEABzqwNYPwKT6YZvpgymdbgx6wniBRUeJ7q4skNhgbV/HW\n8GovqQ16mhRBKLd96MG2xuQ6jzDRIrrLpg7AqfWGCYcE8BOC/3r8mDzOahmyhCsZ\nrD8LuRe5hHoERWF2kI5q20T+eO9BozfOYlzWtOJAjcNz0h2rTeNgAkH4Yn28+UmM\nxb7E76Rrec049FKxFXSyOl/YpJ4FyqYt+EwVHSgQIrX8JWAxPN0Q9WfvhLwMJO4R\nH4nT564QWlUsuxIALQ5AMaHF85ybOnMqarUYQgo/8HrhFrNdQnIGovdIll83u0D9\n48ZGkeTkjrI8EHdBaZImT2OSlh6VSRB4VmLGxhjG9QKBgQDexMigxoDCGm+3/ciN\nljiC8TPsoL47WQHNw9uLDqjP+IcetUQsjnZvRTGsM0w0exyiG5KPLQvNeIo6DFAQ\nWzGM0yPV0I4aV9BfrMCP31sVrMQ/pCgq2o6fGvSLE1vEEvmWKeXWaGnAoP5O6IJc\nUKwhgJa70ue52kvZN6kCeebblQKBgQDDYrSO6pKqotvdNFE7bcYa+RiHB59DGafi\nap0rMG8HLEluCQddf64oIANZABqFJJOzeL+Lgs2wWWs3A83qs9tI27hLCVITWJJ1\nzU9lT5j8YHi6kXwDwasH0Bd1ZUK9+JTrC23WcmRBEzc6yySu78aEDM79a7Xlad9u\nPTtdMKy/FwKBgQDV+2BcT1DPImW97uD+YBXYcajW23DfwReid0gjwukVHD1umd/q\njM3nBCg6qOvCXZ+bd7DIJxT3QZpFOB6QF4j5JLd/Yt2dIEzgGii+CmaL43B/UUfk\nIhxtaI8OKII1TaTBQW2tDo7God6mHWFbG4K8i7A+qtA8DhxdgsGtxzqiIQKBgQCC\ngai3GWnz/io7u9lSh8VeeOnwL6AqkrV339yxX32Z3fQCQpef1Uv/0zpJNW+BZWge\n5dWTm0BGvcOGkMz3K0GajeCwhj5DW9MgSo3wztUSJmIdxFWAsNjLtCwnJwcIm0Tl\nJtIr/maGrQ4kAFK1YsVHqMKNtWdfIHO0T8QaQAvy6wKBgQDNX21Iic2upEV/ZiSe\nFxeyiaU44ptFRsMg0mcu/+6ekv7aD6SDnUHpsJjJ5/a0cr5VCbhnixbLzG+4V9Yn\n95JQAEz5dMBmsdiJwJNh7D1y0pso/FFckPZNUgsW7sc+Q2Jlt/z7KqnD5KKhFRgW\n5CEn1bpDgCrebZFjUzmQPzr/Cg==\n-----END PRIVATE KEY-----\n";

export const getCurrentDate = () => {
  //let getCurrentDate() use this format 2024-09-03
  //return new Date().toISOString().split("T")[0];
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};
//


