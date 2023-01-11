import {
  Collection,
  CollectionId,
  Database,
  Field,
  FieldId,
  NativeQuerySnippet,
  NativeQuerySnippetId,
  Table,
  User,
  UserId,
  WritebackAction,
} from "metabase-types/api";

export interface EntitiesState {
  actions?: Record<number, WritebackAction>;
  collections?: Record<CollectionId, Collection>;
  databases?: Record<number, Database>;
  fields?: Record<FieldId, Field>;
  tables?: Record<number | string, Table>;
  snippets?: Record<NativeQuerySnippetId, NativeQuerySnippet>;
  users?: Record<UserId, User>;
}
