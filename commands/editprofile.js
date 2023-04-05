const { SlashCommandBuilder, ComponentType, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder } = require("discord.js");
const { Card, User, Character } = require("../models");
const { UserUtils, ReplyUtils } = require("../util");

const pageSize = 8;

//fetch all cards owned by the user and list them
module.exports = {
    data: new SlashCommandBuilder()
            .setName("editprofile")
            .setDescription("Edit your profile"),
    permissionLevel: 0,
    async execute(interaction) {
        await interaction.deferReply();
        let user = await UserUtils.getUserByDiscordId(interaction.member.id);

        let profile = await user.getProfile();
        
        

        //row of button components to select what property to edit
        const mainRow = new ActionRowBuilder();
        mainRow.addComponents(
            new ButtonBuilder()
                .setLabel('Edit Status')
                .setCustomId('editStatus')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setLabel('Edit Showcase')
                .setCustomId('editShowcase')
                .setStyle(ButtonStyle.Primary)
        );

        const pingRow = new ActionRowBuilder();
        pingRow.addComponents(
            new ButtonBuilder()
                .setLabel('Wishlist Ping')
                .setCustomId('toggle-wishlist-ping')
                .setStyle(user.wishlistPing ? ButtonStyle.Success : ButtonStyle.Primary),
                new ButtonBuilder()
                .setLabel('Drop Ping')
                .setCustomId('toggle-drop-ping')
                .setStyle(user.dropPing ? ButtonStyle.Success : ButtonStyle.Primary),
                new ButtonBuilder()
                .setLabel('Daily Ping')
                .setCustomId('toggle-daily-ping')
                .setStyle(user.dailyPing ? ButtonStyle.Success : ButtonStyle.Primary)
        );

        //show buttons
        let message = await interaction.editReply({ content: "", components: [mainRow, pingRow], fetchReply: true });

        //filter only events from the user who triggered the command
        const filter = (m) => m.author.id === interaction.author.id;
        const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 25000 })

        collector.on('collect', async (i) => {
            await i.deferReply();
            switch (i.customId) {
                case 'editStatus':
                    await this.openStatusModal(i, user, profile);
                    break;
                case 'editShowcase':
                    await this.openShowcaseModal(i, user, profile);
                    break;
                case 'toggle-wishlist-ping':
                    user.wishlistPing = !user.wishlistPing;
                    user.save();
                    break;
                case 'toggle-drop-ping':
                    user.dropPing = !user.dropPing;
                    user.save();
                    break;
                case 'toggle-daily-ping':
                    user.dailyPing = !user.dailyPing;
                    user.save();
                    break;
                default:
                    i.editReply({ content: "Invalid selection" });
                    return;
                    break;
            }

            let newComponents= ReplyUtils.recreateComponents(message.components);
            newComponents[1].components.forEach(component => {
                if(component.data.custom_id == i.customId) {
                    component.setStyle((component.data.style == 1) ? 3 : 1);
                    console.log(`Changed style of ${component.data.custom_id} is now ${component.data.style}`);
                }
            });
            await message.edit({ components: newComponents });
            let msg = await i.editReply({content: '...'});
            await msg.delete();
        });
    },
    async openShowcaseModal(interaction, user, profile) {
        const modal = new ModalBuilder()
			.setCustomId('cardSlotModal')
			.setTitle('Edit card showcase');

        let slots = ['slotOne', 'slotTwo', 'slotThree', 'slotFour'];
        for (slot of slots) {
            let cardIDComponenets = new ActionRowBuilder();
            let cardInput = new TextInputBuilder()
                .setCustomId(slot)
                .setLabel(`Set ${slot}`)
                .setStyle(TextInputStyle.Short)
                .setRequired(false);            
            let currentCard = await Card.findOne({ where: { id: profile[slot] }, include: [Character] });
            if (currentCard) {
                cardInput.setPlaceholder(`${currentCard.Character.name} (${currentCard.identifier})`);
            }
            cardIDComponenets.addComponents(cardInput);
            modal.addComponents(cardIDComponenets);
        }

        let message = await interaction.showModal(modal);

        let submitted = await interaction.awaitModalSubmit({
            time: 60000,
            filter: i => i.user.id === interaction.user.id,
          }).catch(error => {
            //Error includes timeout
            console.error(error)
            return null
          })
          
          if (submitted) {
            let updatePayload = {};
            for (slot of slots) {
                if (submitted.fields.getTextInputValue(slot) != profile[slot]) {
                    //fetch card from db
                    let card = await Card.findOne({ where: { identifier: submitted.fields.getTextInputValue(slot) } });
                    if (card) {
                        updatePayload[slot] = card.id;
                    }
                }
            }
            profile.update(updatePayload);
            await submitted.reply({
              content: `Updated showcase`,
            })
          }
    },
    async openStatusModal(interaction, user, profile) {
        const modal = new ModalBuilder()
            .setCustomId('descriptionModal')
            .setTitle('Edit profile status/description');

        let row = new ActionRowBuilder();
        let statusInput = new TextInputBuilder()
            .setCustomId('profileStatus')
            .setLabel(`Your status`)
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false)
            .setMaxLength(155)
            .setPlaceholder(profile.customStatus ? profile.customStatus.slice(0,90) + '...' : "No status set");
        row.addComponents(statusInput);
        modal.addComponents(row);

        let message = await interaction.showModal(modal);

        let submitted = await interaction.awaitModalSubmit({
            time: 300000,
            filter: i => i.user.id === interaction.user.id,
          }).catch(error => {
            //Error includes timeout
            console.error(error)
            return null
          })
          
          if (submitted) {
            let updatePayload = {};
            if (submitted.fields.getTextInputValue('profileStatus') != profile.customStatus) {
                profile.update({customStatus: submitted.fields.getTextInputValue('profileStatus')});
            }
            await submitted.reply({
              content: `Updated status`,
            })
          }
    }

}