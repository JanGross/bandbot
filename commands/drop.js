const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, AttachmentBuilder } = require("discord.js");
const { Card, User, Character, DropHistory } = require("../models");
const { customAlphabet } = require("nanoid");
const { CardUtils, UserUtils, ReplyUtils, GeneralUtils, Rendering } = require("../util");
const card = require("../models/card");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("drop")
    .setDescription("Drop a card"),
    
    async execute(interaction) {
        const user = await UserUtils.getUserByDiscordId(interaction.member.id);
        
        const permissionLevel = await UserUtils.getPermissionLevel(interaction.member);
        const cooldowns = await UserUtils.getCooldowns(user);
        if (cooldowns.dropCooldown > 0 && permissionLevel < 2) {
            interaction.reply({
                content: `You can't drop cards for another ${cooldowns.dropCooldown} milliseconds`,
                ephemeral: false
            });
            return;
        }
        
        //Generate 3 cards, each is persisted with an initial userId of NULL
        const cards = [];
        for (let i = 0; i < 3; i++) {
            //get number of characters in database
            const characterId = Math.floor(Math.random() * await CardUtils.getCharacterCount()) + 1;
            console.log(`characterId: ${characterId}`);
            //random number between 1 and 6
            let newCard = await Card.create({
                characterId: characterId,
                identifier: CardUtils.generateIdentifier(),
                quality: Math.floor(Math.random() * 6) + 1,
                printNr: await CardUtils.getNextPrintNumber(characterId),
                
            });
            cards.push(newCard);
        }

        cards.sort((a, b) => a.characterId - b.characterId);
        
        const row = new ActionRowBuilder();
        let deckImage = await Rendering.renderCardStack(cards);

        for (const [i, card] of cards.entries()) {
            let character = await Character.findOne({
                where: {
                    id: card.characterId
                }
            });
        
            //Add claim button for each card
            row.addComponents(
				new ButtonBuilder()
					.setCustomId(`claim-${i}-${card.identifier}`)
					.setLabel(`Claim  ${i+1}`)
					.setStyle(ButtonStyle.Primary),
			);
        }

        const file = new AttachmentBuilder(deckImage);
    
        const message = await interaction.reply({ content: 'asd', components: [row], files: [file], fetchReply: true });

		//const message = await interaction.reply({ content: reply, components: [row], fetchReply: true });
        //set users drop cooldown
        await UserUtils.setCooldown(user, "drop", await GeneralUtils.getBotProperty("dropTimeout"));

        const filter = m => m.author.id === interaction.user.id;
        const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 25000 });

        collector.on('collect', async i => {
            let cardId = i.customId.split("-")[1];
            if (await cards[cardId].userId) { i.reply({ content: "This card has already been claimed!", ephemeral: true }); return; }

            let claimUser = await UserUtils.getUserByDiscordId(i.user.id);
            const cooldowns = await UserUtils.getCooldowns(user);
            if (cooldowns.pullCooldown > 0 && permissionLevel < 2) {
                i.reply({
                    content: `You can't claim cards for another ${cooldowns.dropCooldown} milliseconds`,
                    ephemeral: false
                });
                return;
            }

            if (claimUser) {
                //Update card with the user id
                cards[cardId].userId = claimUser.id;
                await UserUtils.setCooldown(user, "pull", await GeneralUtils.getBotProperty("pullTimeout"));
                await cards[cardId].save();
                
                //fetch character name from database given the character id
                let character = await Character.findOne({
                    attributes: ["name"],
                    where: {
                        id: cards[cardId].characterId
                    }
                });
                i.reply({ content: `${i.user} (${claimUser.id}) claimed a card! [${cards[cardId].identifier}]`, ephemeral: false });
                let newRow = ReplyUtils.recreateComponents(i.message.components);
                newRow.components[cardId].setLabel("Claimed");
                newRow.components[cardId].setStyle(ButtonStyle.Success);
                newRow.components[cardId].setDisabled(true);
                //let deckImage = await Rendering.renderCardStack(cards);
                message.edit({ components: [newRow] });
            }
        });
        
        collector.on('end', async collected => {
            let dropHistory = {};
            
            console.log(`Collected ${collected.size} interactions.`);
            for (let card of cards) {
                if (!card.userId) {
                    card.userId = 1;
                    await card.save();
                }
                let historyEntry = {
                    cardData: JSON.stringify(card),
                    ogUserId: card.userId,
                };
                dropHistory[card.identifier] = historyEntry;
            }

            //create new drop history entry
            let history = await DropHistory.create({
                dropData: JSON.stringify(dropHistory),
            });


            
            let deckImage = await Rendering.renderCardStack(cards);
            message.edit({ components: [], files: [new AttachmentBuilder(deckImage)] });
        });
        
    }
}