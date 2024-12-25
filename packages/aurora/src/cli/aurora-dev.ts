import { getProjectDir } from '../lib/get-project-dir';

let dir: string;

export const auroraDev = async (port: number) => {
  dir = getProjectDir(process.env.NEXT_PRIVATE_DEV_DIR);
  console.log('auroraDev', dir, port);
};
