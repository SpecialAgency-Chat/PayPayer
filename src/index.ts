import axios from "axios";
import { Client, Intents, Modal, ModalActionRowComponent, MessageActionRow, TextInputComponent } from "discord.js";
import { PayPay } from "paypay.js";

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.on("ready", (cl) => {
  console.log("ready");
  cl.application.commands.set([
    {
      name: "login",
      description: "PayPayにログインします"
    },
    {
      name: "get_balance",
      description: "残高を確認します"
    },
    {
      name: "link_info",
      description: "リンクの情報を表示",
      options: [
        {
          type: "STRING",
          name: "link",
          description: "リンク",
          required: true
        }
      ]
    },
    {
      name: "receive",
      description: "リンクを受け取ります"
    },
    {
      name: "decline",
      description: "リンクを辞退します",
      options: [
        {
          type: "STRING",
          name: "link",
          description: "リンク",
          required: true
        }
      ]
    },
    {
      name: "get_history",
      description: "PayPayの履歴を表示"
    }
  ]);
});

client.on("interactionCreate", async (i) => {
  if (i.isCommand()) {
    const { commandName:command } = i;
    if (command === "login") {
      const p = new PayPay();
      const modal = new Modal()
        .setCustomId("login")
        .setTitle("PayPayにログイン")
        .setComponents(new MessageActionRow<ModalActionRowComponent>().addComponents(
          new TextInputComponent()
            .setCustomId("phone")
            .setLabel("電話番号")
            .setMaxLength(12)
            .setMinLength(8)
            .setPlaceholder("例: 08012345678")
            .setRequired(true)
            .setStyle("SHORT")
        ))
    }
  }
});