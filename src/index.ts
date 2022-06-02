import axios from "axios";
import { Client, Intents, Modal, ModalActionRowComponent, MessageActionRow, TextInputComponent, type Snowflake, MessageButton } from "discord.js";
import { PayPay, PayPayLoginStatus } from "paypay.js";
import mongoose from "mongoose";

type Account = {
  phone: string;
  accessToken: string;
}

type User = {
  id: Snowflake,
  accounts: Account[],
  current: Account,
  save(): Promise<void>
} | null;

const schema = new mongoose.Schema({
  id: String,
  accounts: Array,
  current: {
    phone: String,
    accessToken: String
  },
});

const db = mongoose.model<User>("paypayer", schema);

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
    },
    {
      name: "logout",
      description: "PayPayからログアウトします",
      options: [
        {
          type: "STRING",
          name: "phone",
          description: "電話番号",
          required: true,
          autocomplete: true
        }
      ]
    },
    {
      name: "accounts",
      description: "PayPayのアカウントを表示"
    },
    {
      name: "switch",
      description: "PayPayのアカウントを切り替えます",
      options: [
        {
          type: "STRING",
          name: "phone",
          description: "電話番号",
          required: true,
          autocomplete: true
        }
      ]
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
        .setComponents(
          new MessageActionRow<ModalActionRowComponent>().addComponents(
            new TextInputComponent()
              .setCustomId("phone")
              .setLabel("電話番号")
              .setMaxLength(12)
              .setMinLength(8)
              .setPlaceholder("例: 08012345678")
              .setRequired(true)
              .setStyle("SHORT")
          ),
          new MessageActionRow<ModalActionRowComponent>().addComponents(
            new TextInputComponent()
              .setCustomId("password")
              .setLabel("パスワード")
              .setMaxLength(30)
              .setMinLength(1)
              .setPlaceholder("例: p@ssw0rd")
              .setRequired(true)
              .setStyle("SHORT")
          )
        );
      await i.showModal(modal);
      const mi = await i.awaitModalSubmit({ time: 1000000 });
      await mi.deferReply({ ephemeral: true });
      try {
        const result = await p.login(mi.fields.getTextInputValue("phone"), mi.fields.getTextInputValue("password"));
        if (result.status === PayPayLoginStatus.DONE) {
          await mi.followUp("ログインしました。");
          const user: NonNullable<User> = await db.findOne({ id: i.user.id }) || new db();
          user.accounts.push({ phone: mi.fields.getTextInputValue("phone"), accessToken: result.accessToken });
          await user.save();
        } else if (result.status === PayPayLoginStatus.OTP_REQUIRED) {
          const but = new MessageButton()
            .setCustomId("otp")
            .setLabel("OTPを入力する")
            .setStyle("PRIMARY")
        }
      } catch {
        await mi.followUp("ログインに失敗しました。");
      }
    }
  }
});