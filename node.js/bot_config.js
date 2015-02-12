/* The name of the SteamBot */
var botName = "FoxedBot";

/* The Steam username and password of the SteamBot */
var accountName = "foxedbot";
var password = "***********";


/* The ServerKey of the SteamBot */
var serverKey = "fpofYzF65dQe";

/* The port that the SteamBot will listen on */
var botPort = 25000;


/* Echo incoming message to the console */
var showChat = true;

/* Sends messages even if the target is offline */
var sendOffline = false;

/* The character that will be used to parse commands */
var commandChar = "!";

/* Which SteamID64 are superadmins */
var admins = [
	"76561198035539471", // _FR_Starfox64
	"76561198013178101" // Larry
];

var servers = [];

/* Your Garry's Mod servers */
/* The ServerIDs must start at 0 and be incremented by 1 for each server (not more) if you remove a server you must change the ServerIDs so that there aren't any "holes" */
servers[0] = {
	name: "Starfox64's DEV Server #1",
	ip: "127.0.0.1",
	port: 25101
};

servers[1] = {
	name: "Starfox64's DEV Server #2",
	ip: "127.0.0.1",
	port: 25102
};

servers[2] = {
	name: "Starfox64's DEV Server #3",
	ip: "127.0.0.1",
	port: 25103
};