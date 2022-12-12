import { createStore } from "solid-js/store";
import { GameSettings } from "~/common/types";
import {
  characterNameByExternalId,
  ExternalCharacterName,
  ExternalStageName,
  stageNameByExternalId,
} from "~/common/ids";
import { createEffect, on } from "solid-js";
import { FileStore, fileStore } from "~/state/fileStore";

export type Filter =
  | { type: "character"; label: ExternalCharacterName }
  | { type: "stage"; label: ExternalStageName }
  | { type: "codeOrName"; label: string };

export interface SelectionState {
  filters: Filter[];
  filteredFilesAndSettings: [File, GameSettings][];
  selectedFileAndSettings?: [File, GameSettings];
}

function createSelectionStore(stubStore: FileStore) {
  const [selectionState, setSelectionState] = createStore<SelectionState>({
    filters: [],
    filteredFilesAndSettings: [],
  });

  function setFilters(filters: Filter[]) {
    setSelectionState("filters", filters);
  }

  function select(fileAndSettings: [File, GameSettings]) {
    setSelectionState("selectedFileAndSettings", fileAndSettings);
  }

  function nextFile() {
    if (selectionState.filteredFilesAndSettings.length === 0) {
      return;
    }
    if (selectionState.selectedFileAndSettings === undefined) {
      setSelectionState(
        "selectedFileAndSettings",
        selectionState.filteredFilesAndSettings[0]
      );
    } else {
      const currentIndex = selectionState.filteredFilesAndSettings.findIndex(
        ([file]) => file === selectionState.selectedFileAndSettings![0]
      );
      const nextIndex = wrap(
        currentIndex + 1,
        selectionState.filteredFilesAndSettings.length
      );
      setSelectionState(
        "selectedFileAndSettings",
        selectionState.filteredFilesAndSettings[nextIndex]
      );
    }
  }

  function previousFile() {
    if (selectionState.filteredFilesAndSettings.length === 0) {
      return;
    }
    if (selectionState.selectedFileAndSettings === undefined) {
      setSelectionState(
        "selectedFileAndSettings",
        selectionState.filteredFilesAndSettings[0]
      );
    } else {
      const currentIndex = selectionState.filteredFilesAndSettings.findIndex(
        ([file]) => file === selectionState.selectedFileAndSettings![0]
      );
      const nextIndex = wrap(
        currentIndex - 1,
        selectionState.filteredFilesAndSettings.length
      );
      setSelectionState(
        "selectedFileAndSettings",
        selectionState.filteredFilesAndSettings[nextIndex]
      );
    }
  }

  createEffect(
    on(
      () => stubStore.files,
      () => {
        setSelectionState({ selectedFileAndSettings: undefined });
      }
    )
  );

  // Update filter results if files, gameSettings, or filters change
  createEffect(() => {
    const filesWithSettings = stubStore.files.map(
      (file, i): [File, GameSettings] => [file, stubStore.gameSettings[i]]
    );
    setSelectionState(
      "filteredFilesAndSettings",
      applyFilters(filesWithSettings, selectionState.filters)
    );
  });

  // ???
  createEffect(() => {
    if (
      selectionState.filteredFilesAndSettings.length > 0 &&
      selectionState.selectedFileAndSettings === undefined
    ) {
      setSelectionState(
        "selectedFileAndSettings",
        selectionState.filteredFilesAndSettings[0]
      );
    }
  });

  return { data: selectionState, previousFile, setFilters, select, nextFile };
}

function applyFilters(
  filesWithSettings: [File, GameSettings][],
  filters: Filter[]
): [File, GameSettings][] {
  const charactersNeeded: Record<string, number> = {};
  filters
    .filter(
      (filter): filter is Filter & { type: "character" } =>
        filter.type === "character"
    )
    .forEach(
      (filter) =>
        (charactersNeeded[filter.label] =
          (charactersNeeded[filter.label] ?? 0) + 1)
    );
  const stagesAllowed = filters
    .filter((filter) => filter.type === "stage")
    .map((filter) => filter.label);
  const namesNeeded = filters
    .filter((filter) => filter.type === "codeOrName")
    .map((filter) => filter.label);
  return filesWithSettings.filter(([file, gameSettings]) => {
    const areCharactersSatisfied = Object.entries(charactersNeeded).every(
      ([character, amountRequired]) =>
        gameSettings.playerSettings.filter(
          (p) => character === characterNameByExternalId[p.externalCharacterId]
        ).length >= amountRequired
    );
    const stagePass =
      stagesAllowed.length === 0 ||
      stagesAllowed.includes(stageNameByExternalId[gameSettings.stageId]);
    const areNamesSatisfied = namesNeeded.every((name) =>
      gameSettings.playerSettings.some((p) =>
        [
          p.connectCode?.toLowerCase(),
          p.displayName?.toLowerCase(),
          p.nametag?.toLowerCase(),
        ].includes(name.toLowerCase())
      )
    );
    return stagePass && areCharactersSatisfied && areNamesSatisfied;
  });
}

function wrap(index: number, limit: number): number {
  if (limit === 0) {
    return 0;
  }
  return (index + limit) % limit;
}

export const localLibrary = createSelectionStore(fileStore);
