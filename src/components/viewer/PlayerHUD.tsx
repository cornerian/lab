import { createMemo, For, Show } from "solid-js";
import { characterNameByInternalId } from "~/common/ids";
import { HexagonIcon } from "~/components/common/icons";
import { RenderData, replayStore } from "~/state/replayStore";

export function PlayerHUD(props: { player: number }) {
  const renderData = createMemo(() =>
    replayStore.renderDatas.find(
      (renderData) =>
        renderData.playerSettings.playerIndex === props.player &&
        renderData.playerState.isNana === false
    )
  );
  const position = createMemo(() => ({
    x: -30 + 20 * props.player, // ports at: -30%, -10%, 10%, 30%
    y: 35, // y% is flipped by css to make the text right-side up.
  }));
  const name = createMemo(() =>
    renderData()
      ? [
          renderData()!.playerSettings.displayName,
          renderData()!.playerSettings.connectCode,
          renderData()!.playerSettings.nametag,
          renderData()!.playerSettings.displayName,
          characterNameByInternalId[
            renderData()!.playerState.internalCharacterId
          ],
        ].find((n) => n !== undefined && n.length > 0)
      : ""
  );

  return (
    <>
      <Show when={renderData()}>
        <For each={Array(renderData()!.playerState.stocksRemaining).fill(0)}>
          {(_, i) => (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill={renderData()!.innerColor}
              stroke="white"
              stroke-width="10px"
              viewBox="0 12.37 184.77 160.02"
              x={`${position().x - 50 - 3 * (1.5 - i())}%`}
              y={`-${position().y}%`}
              height={15}
            >
              <path d="M0,92.375l46.188-80h92.378l46.185,80l-46.185,80H46.188L0,92.375z"/>
            </svg>
          )}
        </For>
        <text
          style={{ font: "bold 40px Archivo Black", transform: "scaleY(-1)" }}
          x={`${position().x}%`}
          y={`${position().y + 7}%`}
          text-anchor="middle"
          textContent={`${Math.floor(renderData()!.playerState.percent)}%`}
          fill="currentColor"
          stroke="white"
          stroke-width="0.5"
        />
        <text
          style={{ font: "bold 15px sans-serif", transform: "scaleY(-1)" }}
          x={`${position().x}%`}
          y={`${position().y + 11}%`}
          text-anchor="middle"
          textContent={name()}
          fill="white"
          stroke={renderData()!.innerColor}
          stroke-width="0.5"
        />
        <Show when={replayStore.isDebug}>
          <Debug position={position()} renderData={renderData()!} />
        </Show>
      </Show>
    </>
  );
}

function Debug(props: {
  position: { x: number; y: number };
  renderData: RenderData;
}) {
  return (
    <>
      <text
        style={{ font: "bold 15px sans-serif", transform: "scaleY(-1)" }}
        x={`${props.position.x}%`}
        y="-40%"
        text-anchor="middle"
        textContent={`State ID: ${props.renderData.playerState.actionStateId}`}
        fill={props.renderData.innerColor}
        stroke="black"
      />
      <text
        style={{ font: "bold 15px sans-serif", transform: "scaleY(-1)" }}
        x={`${props.position.x}%`}
        y="-37%"
        text-anchor="middle"
        textContent={`State Frame: ${parseFloat(
          props.renderData.playerState.actionStateFrameCounter.toFixed(4)
        )}`}
        fill={props.renderData.innerColor}
        stroke="black"
      />
      <text
        style={{ font: "bold 15px sans-serif", transform: "scaleY(-1)" }}
        x={`${props.position.x}%`}
        y="-34%"
        text-anchor="middle"
        textContent={`X: ${parseFloat(
          props.renderData.playerState.xPosition.toFixed(4)
        )}`}
        fill={props.renderData.innerColor}
        stroke="black"
      />
      <text
        style={{ font: "bold 15px sans-serif", transform: "scaleY(-1)" }}
        x={`${props.position.x}%`}
        y="-31%"
        text-anchor="middle"
        textContent={`Y: ${parseFloat(
          props.renderData.playerState.yPosition.toFixed(4)
        )}`}
        fill={props.renderData.innerColor}
        stroke="black"
      />
      <text
        style={{ font: "bold 15px sans-serif", transform: "scaleY(-1)" }}
        x={`${props.position.x}%`}
        y="-28%"
        text-anchor="middle"
        textContent={props.renderData.animationName}
        fill={props.renderData.innerColor}
        stroke="black"
      />
    </>
  );
}
