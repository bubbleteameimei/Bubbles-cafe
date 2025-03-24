// Create a utility file for comment moderation
const bannedWordsRegex = new RegExp(
  "\\b(" +
    // Profanity & Swearing
    "(f+u+c+k+|s+h+i+t+|b+i+t+c+h+|a+s+s+h+o+l+e+|c+u+n+t+|m+o+t+h+e+r+f+u+c+k+e+r+|d+i+c+k+|p+u+s+s+y+|t+w+a+t+|b+a+s+t+a+r+d+|w+h+o+r+e+|s+l+u+t+)" +
    
    "|" + 
    // Hate Speech & Discrimination
    "(n+i+g+g+e+r+|c+h+i+n+k+|s+p+i+c+|k+i+k+e+|f+a+g+g+o+t+|t+r+a+n+n+y+|r+e+t+a+r+d+|g+y+p+s+y+|s+a+n+d+n+i+g+g+e+r+)" +

    "|" + 
    // Harassment & Threats
    "(kill(\\s*yourself|\\s*him|\\s*her)|d+o+x+|i+\\s*h+o+p+e+\\s*y+o+u+\\s*d+i+e+|y+o+u+\\s*s+h+o+u+l+d+\\s*k+i+l+l+\\s*y+o+u+r+s+e+l+f+|c+o+m+m+i+t+\\s*s+u+i+c+i+d+e+)" +

    "|" + 
    // Spam & Scams
    "(b+u+y+\\s*n+o+w+|c+l+i+c+k+\\s*h+e+r+e+|v+i+s+i+t+\\s*m+y+\\s*s+i+t+e+|f+r+e+e+\\s*m+o+n+e+y+|s+e+x+y+\\s*g+i+r+l+s+|f+r+e+e+\\s*g+i+f+t+\\s*c+a+r+d+|c+h+e+a+p+\\s*d+r+u+g+s+)" +

    "|" +
    // NSFW, Gore, & Exploitation
    "(p+o+r+n+|r+a+p+e+|c+h+i+l+d+\\s+p+o+r+n+|b+e+h+e+a+d+|m+u+r+d+e+r+|b+l+o+o+d+|s+n+u+f+f+)" +

    "|" +
    // Misinformation & Dangerous Content
    "(d+r+i+n+k+\\s*b+l+e+a+c+h+|v+a+c+c+i+n+e+s+\\s*c+a+u+s+e+\\s*a+u+t+i+s+m+|c+o+v+i+d+\\s*i+s+\\s*f+a+k+e+)" +
  ")\\b", "i"
);

export const moderateComment = (text: string): { 
  isBlocked: boolean; 
  moderatedText: string;
} => {
  const hasInappropriateContent = bannedWordsRegex.test(text);
  const moderatedText = hasInappropriateContent ? 
    text.replace(bannedWordsRegex, match => "*".repeat(match.length)) : 
    text;

  return {
    isBlocked: hasInappropriateContent,
    moderatedText
  };
};
