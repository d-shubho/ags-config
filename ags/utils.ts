
export function blurImg(img: string) {
  const cache = Utils.CACHE_DIR + '/media';
  return new Promise(resolve => {
    if (!img)
      resolve('');

    const dir = cache + '/blurred';
    const blurred = dir + img.substring(cache.length) + ".png";

    Utils.ensureDirectory(dir);
    Utils.execAsync([
      'ffmpeg',
      '-i', img,
      '-vframes', "2",
      '-vf', 'gblur=sigma=30',
      '-update', '1',
      blurred,
      '-y'
    ])
      .then(() => {
        resolve(blurred)
      })
      .catch((e) => {
        print("not resolved: " + e)
        resolve('')
      });
  });
}
