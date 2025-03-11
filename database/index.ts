// barrel file to export all models so all model are loaded before the startup of the app
import { Account } from "./account.model";
import { Answer } from "./answer.model";
import { Collection } from "./collection.model";
import { Interaction } from "./interaction.model";
import { Question } from "./question.model";
import { TagQuestion } from "./tag-question.model";
import { Tag } from "./tag.model";
import { User } from "./user.model";
import { Vote } from "./vote.model";

export { Account, Answer, Collection, Interaction, Question, TagQuestion, Tag, User, Vote };
