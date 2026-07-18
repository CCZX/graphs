export interface ILineAnchorService {
	/** 图形 base 变更后，重算锚定到这些图形的连线端点并回写 */
	reanchor(changedShapeIds: Set<string>): void;

	/** 图形删除后，解除连线对它们的锚定（保留当前坐标为自由端点） */
	detach(removedShapeIds: Set<string>): void;
}
export const ILineAnchorService = Symbol('ILineAnchorService');
