export const shortenUrl = async (longUrl) => {
    const response = await fetch(
      'https://api-ssl.bitly.com/v4/shorten',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer 178b32ff89aee198023dcdddd5b2801cbd482e5d`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          long_url: longUrl,
        }),
      }
    );

    const data = await response.json();

    console.log("Bitly Response:", data);

    if (!response.ok) {
      throw new Error(data.message || "Failed to shorten URL");
    }

    return data.link;
};