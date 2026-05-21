export interface ActionContext {
  payload: Record<string, any>;
  propsValue: Record<string, any>;
}

export interface Action {
  name: string;
  displayName: string;
  description: string;
  run: (context: ActionContext) => Promise<any>;
}

export interface Piece {
  name: string;
  displayName: string;
  logoUrl: string;
  actions: Record<string, Action>;
}

export const createAction = (action: Action): Action => action;
export const createPiece = (piece: Piece): Piece => piece;
