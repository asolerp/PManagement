const extractFileNameFromURL = (url) => {
    let decodedPathname = decodeURIComponent(url); // Decodes the URL encoded pathname
    let photoName = decodedPathname.split('/').pop().split('?')[0]; // Splits the pathname by "/" and returns the last part of the array
    return photoName;
}

export default extractFileNameFromURL;